import { Hono } from "hono";
import { cors } from "hono/cors";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import { ApiRegistry } from "./api-registry";
import { AuthService } from "./auth-service";
import { createDynamicPaymentMiddleware, proxyToTargetApi } from "./payment-middleware";
import type { Resource, Network } from "x402-hono";

const app = new Hono<{ Bindings: CloudflareBindings }>();

// CORS middleware with credentials
app.use("*", cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://p402.pages.dev'
  ],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Public APIs endpoint (before payment middleware to avoid charging)
app.get("/api/public/apis", async (c) => {
  try {
    const registry = new ApiRegistry(c.env.DB);
    const apis = await registry.getAllActiveApis();
    
    // Remove sensitive fields from response (including headers)
    const publicApis = apis.map(({ id, api_name, description, price, network, owner_address, created_at, documentation, tags }) => ({
      id,
      api_name,
      description,
      price,
      network,
      owner_address,
      created_at,
      documentation,
      tags
    }));
    
    return c.json({ 
      success: true,
      count: publicApis.length,
      apis: publicApis
    });
  } catch (error) {
    console.error("Failed to list public APIs:", error);
    return c.json({
      error: "Database Error",
      message: "Failed to retrieve public API list",
      code: "DB_ERROR"
    }, 500);
  }
});

// Dynamic payment middleware (only for proxy routes)
app.use("/api/:id/*", async (c, next) => {
  const middleware = createDynamicPaymentMiddleware(c.env.DB, {
    facilitatorUrl: c.env.FACILITATOR_URL as Resource,
    paymentAddress: c.env.PAYMENT_ADDRESS as `0x${string}`,
    network: c.env.NETWORK as Network,
  });
  return await middleware(c, next);
});

app.use("/api/:id", async (c, next) => {
  const middleware = createDynamicPaymentMiddleware(c.env.DB, {
    facilitatorUrl: c.env.FACILITATOR_URL as Resource,
    paymentAddress: c.env.PAYMENT_ADDRESS as `0x${string}`,
    network: c.env.NETWORK as Network,
  });
  return await middleware(c, next);
});

// Health check
app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "P402 Dynamic API Payment Gateway",
    version: "1.0.0",
    endpoints: {
      auth: "/auth/*",
      management: "/manage/*",
      proxy: "/api/:id/*",
      dashboard: "/dashboard.html"
    }
  });
});

// ==================== Authentication Routes ====================

// Request nonce for signing
app.post("/auth/nonce", async (c) => {
  try {
    const { address } = await c.req.json();

    if (!address || !address.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
      return c.json({
        error: "Invalid Address",
        message: "Address must be a valid Solana address",
        code: "INVALID_ADDRESS"
      }, 400);
    }

    const authService = new AuthService(c.env.DB);
    const nonce = authService.generateNonce();
    const message = authService.createAuthMessage(address, nonce);

    await authService.storeNonce(address, nonce);

    return c.json({
      success: true,
      nonce,
      message
    });
  } catch (error) {
    console.error("Nonce generation error:", error);
    return c.json({
      error: "Server Error",
      message: "Failed to generate nonce",
      code: "NONCE_ERROR"
    }, 500);
  }
});

// Verify signature and create session
app.post("/auth/verify", async (c) => {
  try {
    const { address, message, signature } = await c.req.json();

    if (!address || !message || !signature) {
      return c.json({
        error: "Missing Fields",
        message: "address, message, and signature are required",
        code: "MISSING_FIELDS"
      }, 400);
    }

    const authService = new AuthService(c.env.DB);

    // Verify signature
    const isValid = authService.verifySignature(message, signature, address);
    if (!isValid) {
      return c.json({
        error: "Invalid Signature",
        message: "Signature verification failed",
        code: "INVALID_SIGNATURE"
      }, 401);
    }

    // Extract and verify nonce from message
    const nonceMatch = message.match(/Nonce: ([^\n]+)/);
    if (!nonceMatch) {
      return c.json({
        error: "Invalid Message",
        message: "Message format is invalid",
        code: "INVALID_MESSAGE"
      }, 400);
    }

    const nonce = nonceMatch[1];
    const nonceValid = await authService.verifyNonce(address, nonce);
    if (!nonceValid) {
      return c.json({
        error: "Invalid Nonce",
        message: "Nonce is invalid or expired",
        code: "INVALID_NONCE"
      }, 401);
    }

    // Create session
    const sessionId = await authService.createSession(address);

    // Set secure cookie
    setCookie(c, 'p402_session', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    });

    return c.json({
      success: true,
      address,
      sessionId
    });
  } catch (error) {
    console.error("Verification error:", error);
    return c.json({
      error: "Server Error",
      message: "Failed to verify signature",
      code: "VERIFICATION_ERROR"
    }, 500);
  }
});

// Get current session
app.get("/auth/session", async (c) => {
  try {
    const sessionId = getCookie(c, 'p402_session');
    
    if (!sessionId) {
      return c.json({
        authenticated: false
      });
    }

    const authService = new AuthService(c.env.DB);
    const address = await authService.verifySession(sessionId);

    if (!address) {
      deleteCookie(c, 'p402_session');
      return c.json({
        authenticated: false
      });
    }

    return c.json({
      authenticated: true,
      address
    });
  } catch (error) {
    console.error("Session check error:", error);
    return c.json({
      authenticated: false
    });
  }
});

// Logout
app.post("/auth/logout", async (c) => {
  try {
    const sessionId = getCookie(c, 'p402_session');
    
    if (sessionId) {
      const authService = new AuthService(c.env.DB);
      await authService.deleteSession(sessionId);
    }

    deleteCookie(c, 'p402_session');

    return c.json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error("Logout error:", error);
    return c.json({
      error: "Server Error",
      message: "Failed to logout",
      code: "LOGOUT_ERROR"
    }, 500);
  }
});

// ==================== Management Routes ====================

// List all APIs
app.get("/manage/apis", async (c) => {
  try {
    const registry = new ApiRegistry(c.env.DB);
    const apis = await registry.getAllActiveApis();
    return c.json({ 
      success: true,
      count: apis.length,
      apis 
    });
  } catch (error) {
    console.error("Failed to list APIs:", error);
    return c.json({
      error: "Database Error",
      message: "Failed to retrieve API list",
      code: "DB_ERROR"
    }, 500);
  }
});

// List user's APIs
app.get("/manage/my-apis/:address", async (c) => {
  try {
    const address = c.req.param("address");
    

    
    const registry = new ApiRegistry(c.env.DB);
    const apis = await registry.getUserApis(address);
    return c.json({ 
      success: true,
      address,
      count: apis.length,
      apis 
    });
  } catch (error) {
    console.error("Failed to list user APIs:", error);
    return c.json({
      error: "Database Error",
      message: "Failed to retrieve user API list",
      code: "DB_ERROR"
    }, 500);
  }
});

// Register new API
app.post("/manage/register", async (c) => {
  try {
    const body = await c.req.json();
    const { owner_address, api_name, description, target_url, price, network, headers } = body;

    // Validate required fields
    if (!owner_address || !api_name || !target_url || !price || !network) {
      return c.json({ 
        error: "Missing Required Fields",
        message: "owner_address, api_name, target_url, price, and network are required",
        code: "MISSING_FIELDS"
      }, 400);
    }

 

    // Validate URL format
    try {
      new URL(target_url);
    } catch {
      return c.json({
        error: "Invalid URL",
        message: "target_url must be a valid HTTP/HTTPS URL",
        code: "INVALID_URL"
      }, 400);
    }

    // Validate price format
    if (!price.match(/^\$\d+(\.\d+)?$/)) {
      return c.json({
        error: "Invalid Price",
        message: "price must be in format: $0.001",
        code: "INVALID_PRICE"
      }, 400);
    }

    // Validate and stringify headers if provided
    let headersStr = '{}';
    if (headers && typeof headers === 'object') {
      headersStr = JSON.stringify(headers);
    }

    const registry = new ApiRegistry(c.env.DB);
    const api = await registry.registerApi({
      owner_address,
      api_name,
      description,
      target_url,
      price,
      network,
      headers: headersStr,
      is_active: 1,
    });

    const baseUrl = c.req.url.replace(/\/manage\/register$/, "");
    return c.json({
      success: true,
      message: "API registered successfully",
      api,
      proxyUrl: `/api/${api.id}`,
      fullUrl: `${baseUrl}/api/${api.id}`,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return c.json(
      {
        error: "Registration Failed",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        code: "REGISTRATION_ERROR"
      },
      500
    );
  }
});

// Update API
app.put("/manage/apis/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    // Validate UUID format
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return c.json({
        error: "Invalid API ID",
        message: "API ID must be a valid UUID",
        code: "INVALID_ID"
      }, 400);
    }

    // Validate update fields if provided
    if (body.target_url) {
      try {
        new URL(body.target_url);
      } catch {
        return c.json({
          error: "Invalid URL",
          message: "target_url must be a valid HTTP/HTTPS URL",
          code: "INVALID_URL"
        }, 400);
      }
    }

    if (body.price && !body.price.match(/^\$\d+(\.\d+)?$/)) {
      return c.json({
        error: "Invalid Price",
        message: "price must be in format: $0.001",
        code: "INVALID_PRICE"
      }, 400);
    }

    // Convert headers object to JSON string if provided
    if (body.headers && typeof body.headers === 'object') {
      body.headers = JSON.stringify(body.headers);
    }

    const registry = new ApiRegistry(c.env.DB);
    const success = await registry.updateApi(id, body);

    if (!success) {
      return c.json({ 
        error: "Update Failed",
        message: "API not found or update failed",
        code: "UPDATE_FAILED"
      }, 404);
    }

    return c.json({ 
      success: true, 
      message: "API updated successfully" 
    });
  } catch (error) {
    console.error("Update error:", error);
    return c.json(
      {
        error: "Update Failed",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        code: "UPDATE_ERROR"
      },
      500
    );
  }
});

// Delete API
app.delete("/manage/apis/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    // Validate UUID format
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return c.json({
        error: "Invalid API ID",
        message: "API ID must be a valid UUID",
        code: "INVALID_ID"
      }, 400);
    }
    
    const registry = new ApiRegistry(c.env.DB);
    const success = await registry.deleteApi(id);

    if (!success) {
      return c.json({ 
        error: "Delete Failed",
        message: "API not found or delete failed",
        code: "DELETE_FAILED"
      }, 404);
    }

    return c.json({ 
      success: true, 
      message: "API deleted successfully" 
    });
  } catch (error) {
    console.error("Delete error:", error);
    return c.json(
      {
        error: "Delete Failed",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        code: "DELETE_ERROR"
      },
      500
    );
  }
});

// ==================== Proxy Routes ====================

// Dynamic API proxy - supports all HTTP methods
app.all("/api/:id/*", async (c) => {
  const path = c.req.path;
  const registry = new ApiRegistry(c.env.DB);
  
  try {
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

    return await proxyToTargetApi(c, api.target_url, path, api.headers);
  } catch (error) {
    console.error("Proxy route error:", error);
    return c.json({
      error: "Internal Server Error",
      message: "Failed to process proxy request",
      code: "INTERNAL_ERROR"
    }, 500);
  }
});

// Root path proxy support
app.all("/api/:id", async (c) => {
  const path = c.req.path;
  const registry = new ApiRegistry(c.env.DB);
  
  try {
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

    return await proxyToTargetApi(c, api.target_url, path, api.headers);
  } catch (error) {
    console.error("Proxy route error:", error);
    return c.json({
      error: "Internal Server Error",
      message: "Failed to process proxy request",
      code: "INTERNAL_ERROR"
    }, 500);
  }
});

export default app;

