import type { Context, MiddlewareHandler } from "hono";
import { paymentMiddleware, type Network, type Resource } from "x402-hono";
import { ApiRegistry } from "./api-registry";
import { Address as Address$1 } from '@solana/kit';

interface PaymentConfig {
  facilitatorUrl: Resource;
  paymentAddress: `0x${string}`;
  network: Network;
}

export function createDynamicPaymentMiddleware(
  db: D1Database,
  config: PaymentConfig
): MiddlewareHandler {
  const registry = new ApiRegistry(db);

  return async (c: Context, next) => {
    const path = c.req.path;

    // Skip payment check for admin and management routes
    if (path.startsWith("/admin/") || path.startsWith("/manage/")) {
      await next();
      return;
    }

    // Payment check for API proxy routes
    if (path.startsWith("/api/")) {
      const api = await registry.getApiByPath(path);

      if (!api) {
        return c.json({ 
          error: "API Not Found",
          message: "The requested API endpoint does not exist",
          code: "API_NOT_FOUND"
        }, 404);
      }

      if (!api.is_active) {
        return c.json({ 
          error: "API Inactive",
          message: "This API has been deactivated by the owner",
          code: "API_INACTIVE"
        }, 403);
      }

      // Create payment middleware for this specific API
      const pathConfig: Record<string, { price: string; network: Network }> = {
        [path]: {
          price: api.price,
          network: api.network as Network,
        },
      };
      // check address is fit to network
      if (api.network && api.owner_address) {
        if (api.network === 'solana' && !api.owner_address.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
          return c.json({ 
            error: "Invalid Payment Address",
            message: "The payment address is not a valid Solana address",
            code: "INVALID_PAYMENT_ADDRESS"
          }, 400);
        }
        if (api.network !== 'solana' && !api.owner_address.match(/^0x[a-fA-F0-9]{40}$/)) {
          return c.json({ 
            error: "Invalid Payment Address",
            message: "The payment address is not a valid Ethereum address",
            code: "INVALID_PAYMENT_ADDRESS"
          }, 400);
        }
      }

      console.log("Using payment config for API:", {
        owner_address: api.owner_address as Address$1,
        pathConfig,
        facilitator: {
          url: config.facilitatorUrl,
        }
      });

      // Run x402-hono payment middleware
      const payment = paymentMiddleware(
        api.owner_address as Address$1,
        pathConfig,
        {
          url: config.facilitatorUrl,
        }
      );

      // Execute payment middleware
      return await payment(c, next);
    }

    // Continue normally for other routes
    await next();
  };
}

enum ProxyErrorCode {
  INVALID_TARGET_URL = "INVALID_TARGET_URL",
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT = "TIMEOUT",
  TARGET_API_ERROR = "TARGET_API_ERROR",
  DNS_RESOLUTION_FAILED = "DNS_RESOLUTION_FAILED",
  SSL_ERROR = "SSL_ERROR",
  CONNECTION_REFUSED = "CONNECTION_REFUSED",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

interface ProxyErrorResponse {
  error: string;
  code: ProxyErrorCode;
  message: string;
  targetUrl?: string;
  statusCode?: number;
  timestamp: string;
}

function createProxyError(
  code: ProxyErrorCode,
  message: string,
  statusCode: number,
  targetUrl?: string
): ProxyErrorResponse {
  return {
    error: "Proxy Error",
    code,
    message,
    targetUrl,
    statusCode,
    timestamp: new Date().toISOString(),
  };
}

export async function proxyToTargetApi(c: Context, targetUrl: string, originalPath: string, customHeaders?: string) {
  // /api/{api_id}/rest/of/path -> /rest/of/path
  const match = originalPath.match(/^\/api\/[^\/]+(.*)$/);
  const targetPath = match ? match[1] : "";

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
  } catch (error) {
    console.error("Invalid target URL:", targetUrl, error);
    return c.json(
      createProxyError(
        ProxyErrorCode.INVALID_TARGET_URL,
        "Target API URL is malformed or invalid",
        502,
        targetUrl
      ),
      502
    );
  }

  const fullUrl = `${targetUrl.replace(/\/$/, "")}${targetPath || "/"}`;

  try {
    // Prepare headers for target API
    const headers = new Headers();
    
    // Copy relevant headers from original request
    const headersToForward = [
      "content-type",
      "accept",
      "accept-encoding",
      "accept-language",
      "user-agent",
      "authorization",
    ];

    for (const header of headersToForward) {
      const value = c.req.header(header);
      if (value) {
        headers.set(header, value);
      }
    }

    // Set proxy-specific headers
    headers.set("Host", parsedUrl.host);
    headers.set("X-Forwarded-For", c.req.header("cf-connecting-ip") || c.req.header("x-real-ip") || "unknown");
    headers.set("X-Forwarded-Proto", "https");
    headers.set("X-Forwarded-Host", c.req.header("host") || "");
    headers.set("X-Real-IP", c.req.header("cf-connecting-ip") || "");

    // Merge custom headers from API configuration
    if (customHeaders) {
      try {
        const customHeadersObj = JSON.parse(customHeaders) as Record<string, string>;
        for (const [key, value] of Object.entries(customHeadersObj)) {
          if (key && value) {
            headers.set(key, value);
          }
        }
      } catch (error) {
        console.error("Failed to parse custom headers:", error);
      }
    }

    // Make request to target API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let response: Response;
    try {
      response = await fetch(fullUrl, {
        method: c.req.method,
        headers: headers,
        body: c.req.method !== "GET" && c.req.method !== "HEAD" 
          ? await c.req.raw.clone().arrayBuffer() 
          : undefined,
        signal: controller.signal,
        redirect: "follow",
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
      
      // Categorize fetch errors
      if (errorMessage.includes("aborted")) {
        console.error("Proxy timeout:", fullUrl);
        return c.json(
          createProxyError(
            ProxyErrorCode.TIMEOUT,
            "Target API request timed out after 30 seconds",
            504,
            fullUrl
          ),
          504
        );
      }
      
      if (errorMessage.includes("ENOTFOUND") || errorMessage.includes("getaddrinfo")) {
        console.error("DNS resolution failed:", fullUrl, errorMessage);
        return c.json(
          createProxyError(
            ProxyErrorCode.DNS_RESOLUTION_FAILED,
            "Could not resolve target API hostname",
            502,
            fullUrl
          ),
          502
        );
      }
      
      if (errorMessage.includes("ECONNREFUSED")) {
        console.error("Connection refused:", fullUrl, errorMessage);
        return c.json(
          createProxyError(
            ProxyErrorCode.CONNECTION_REFUSED,
            "Target API refused connection",
            503,
            fullUrl
          ),
          503
        );
      }
      
      if (errorMessage.includes("certificate") || errorMessage.includes("SSL") || errorMessage.includes("TLS")) {
        console.error("SSL/TLS error:", fullUrl, errorMessage);
        return c.json(
          createProxyError(
            ProxyErrorCode.SSL_ERROR,
            "SSL/TLS certificate verification failed",
            502,
            fullUrl
          ),
          502
        );
      }
      
      // Generic network error
      console.error("Network error:", fullUrl, errorMessage);
      return c.json(
        createProxyError(
          ProxyErrorCode.NETWORK_ERROR,
          `Network error: ${errorMessage}`,
          502,
          fullUrl
        ),
        502
      );
    }

    clearTimeout(timeoutId);

    // Check if target API returned an error status
    if (!response.ok) {
      console.warn("Target API returned error status:", {
        url: fullUrl,
        status: response.status,
        statusText: response.statusText,
      });
      
      // For 5xx errors from target API, wrap in our error format
      if (response.status >= 500) {
        return c.json(
          createProxyError(
            ProxyErrorCode.TARGET_API_ERROR,
            `Target API returned error: ${response.status} ${response.statusText}`,
            response.status,
            fullUrl
          ),
          502
        );
      }
    }

    // Return successful response from target API
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("X-Proxy-By", "P402");
    responseHeaders.set("X-Proxy-Status", "success");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
    
  } catch (error) {
    // Catch-all for unexpected errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Unexpected proxy error:", {
      url: fullUrl,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return c.json(
      createProxyError(
        ProxyErrorCode.UNKNOWN_ERROR,
        `Unexpected error: ${errorMessage}`,
        500,
        fullUrl
      ),
      500
    );
  }
}
