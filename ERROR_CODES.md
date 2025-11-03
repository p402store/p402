# P402 Error Codes Documentation

## Overview
This document describes all error codes and responses returned by the P402 API Payment Gateway.

## Error Response Format

All errors follow a consistent JSON format:

```json
{
  "error": "Error Title",
  "message": "Detailed error description",
  "code": "ERROR_CODE"
}
```

For proxy errors, additional fields may be included:

```json
{
  "error": "Proxy Error",
  "code": "PROXY_ERROR_CODE",
  "message": "Detailed error description",
  "targetUrl": "https://target-api.com/endpoint",
  "statusCode": 502,
  "timestamp": "2025-11-03T12:34:56.789Z"
}
```

---

## Management API Errors

### API Registration & Management

#### `MISSING_FIELDS` (400)
**Error:** Missing Required Fields  
**Message:** "owner_address, api_name, target_url, price, and network are required"  
**Cause:** One or more required fields are missing from the registration request

#### `INVALID_ADDRESS` (400)
**Error:** Invalid Address  
**Message:** "owner_address must be a valid Ethereum address" or "Wallet address must be a valid Ethereum address"  
**Cause:** The provided wallet address is not a valid Ethereum address (0x + 40 hex characters)

#### `INVALID_URL` (400)
**Error:** Invalid URL  
**Message:** "target_url must be a valid HTTP/HTTPS URL"  
**Cause:** The target URL is malformed or not a valid HTTP/HTTPS URL

#### `INVALID_PRICE` (400)
**Error:** Invalid Price  
**Message:** "price must be in format: $0.001"  
**Cause:** Price must be in the format `$` followed by a number (e.g., $0.001, $1.50)

#### `INVALID_ID` (400)
**Error:** Invalid API ID  
**Message:** "API ID must be a valid UUID"  
**Cause:** The provided API ID is not a valid UUID format

#### `REGISTRATION_ERROR` (500)
**Error:** Registration Failed  
**Message:** Varies based on the underlying error  
**Cause:** Database error or unexpected error during API registration

#### `UPDATE_FAILED` (404)
**Error:** Update Failed  
**Message:** "API not found or update failed"  
**Cause:** The API with the given ID does not exist or the update operation failed

#### `UPDATE_ERROR` (500)
**Error:** Update Failed  
**Message:** Varies based on the underlying error  
**Cause:** Database error or unexpected error during API update

#### `DELETE_FAILED` (404)
**Error:** Delete Failed  
**Message:** "API not found or delete failed"  
**Cause:** The API with the given ID does not exist or the delete operation failed

#### `DELETE_ERROR` (500)
**Error:** Delete Failed  
**Message:** Varies based on the underlying error  
**Cause:** Database error or unexpected error during API deletion

#### `DB_ERROR` (500)
**Error:** Database Error  
**Message:** "Failed to retrieve API list" or "Failed to retrieve user API list"  
**Cause:** Database query failed or connection error

---

## Payment & Access Errors

### API Access Control

#### `API_NOT_FOUND` (404)
**Error:** API Not Found  
**Message:** "The requested API endpoint does not exist"  
**Cause:** The API with the specified ID does not exist in the registry

#### `API_INACTIVE` (403)
**Error:** API Inactive  
**Message:** "This API has been deactivated by the owner"  
**Cause:** The API exists but has been deactivated (`is_active = 0`)

---

## Proxy Errors

### Connection & Network Errors

#### `INVALID_TARGET_URL` (502)
**Error:** Proxy Error  
**Code:** INVALID_TARGET_URL  
**Message:** "Target API URL is malformed or invalid"  
**Cause:** The target URL stored in the database cannot be parsed as a valid URL

**Example Response:**
```json
{
  "error": "Proxy Error",
  "code": "INVALID_TARGET_URL",
  "message": "Target API URL is malformed or invalid",
  "targetUrl": "invalid-url",
  "statusCode": 502,
  "timestamp": "2025-11-03T12:34:56.789Z"
}
```

#### `TIMEOUT` (504)
**Error:** Proxy Error  
**Code:** TIMEOUT  
**Message:** "Target API request timed out after 30 seconds"  
**Cause:** The target API did not respond within 30 seconds

**Example Response:**
```json
{
  "error": "Proxy Error",
  "code": "TIMEOUT",
  "message": "Target API request timed out after 30 seconds",
  "targetUrl": "https://slow-api.com/endpoint",
  "statusCode": 504,
  "timestamp": "2025-11-03T12:34:56.789Z"
}
```

#### `DNS_RESOLUTION_FAILED` (502)
**Error:** Proxy Error  
**Code:** DNS_RESOLUTION_FAILED  
**Message:** "Could not resolve target API hostname"  
**Cause:** The DNS lookup for the target API hostname failed (domain doesn't exist or DNS server unreachable)

**Example Response:**
```json
{
  "error": "Proxy Error",
  "code": "DNS_RESOLUTION_FAILED",
  "message": "Could not resolve target API hostname",
  "targetUrl": "https://nonexistent-domain.com/api",
  "statusCode": 502,
  "timestamp": "2025-11-03T12:34:56.789Z"
}
```

#### `CONNECTION_REFUSED` (503)
**Error:** Proxy Error  
**Code:** CONNECTION_REFUSED  
**Message:** "Target API refused connection"  
**Cause:** The target server actively refused the connection (server is down or not accepting connections)

**Example Response:**
```json
{
  "error": "Proxy Error",
  "code": "CONNECTION_REFUSED",
  "message": "Target API refused connection",
  "targetUrl": "https://api.example.com/endpoint",
  "statusCode": 503,
  "timestamp": "2025-11-03T12:34:56.789Z"
}
```

#### `SSL_ERROR` (502)
**Error:** Proxy Error  
**Code:** SSL_ERROR  
**Message:** "SSL/TLS certificate verification failed"  
**Cause:** The target API's SSL/TLS certificate is invalid, expired, or cannot be verified

**Example Response:**
```json
{
  "error": "Proxy Error",
  "code": "SSL_ERROR",
  "message": "SSL/TLS certificate verification failed",
  "targetUrl": "https://invalid-cert.com/api",
  "statusCode": 502,
  "timestamp": "2025-11-03T12:34:56.789Z"
}
```

#### `NETWORK_ERROR` (502)
**Error:** Proxy Error  
**Code:** NETWORK_ERROR  
**Message:** "Network error: [detailed error message]"  
**Cause:** Generic network error that doesn't fall into other categories

**Example Response:**
```json
{
  "error": "Proxy Error",
  "code": "NETWORK_ERROR",
  "message": "Network error: Connection reset by peer",
  "targetUrl": "https://api.example.com/endpoint",
  "statusCode": 502,
  "timestamp": "2025-11-03T12:34:56.789Z"
}
```

### Target API Errors

#### `TARGET_API_ERROR` (502)
**Error:** Proxy Error  
**Code:** TARGET_API_ERROR  
**Message:** "Target API returned error: [status] [statusText]"  
**Cause:** The target API returned a 5xx server error

**Example Response:**
```json
{
  "error": "Proxy Error",
  "code": "TARGET_API_ERROR",
  "message": "Target API returned error: 503 Service Unavailable",
  "targetUrl": "https://api.example.com/endpoint",
  "statusCode": 503,
  "timestamp": "2025-11-03T12:34:56.789Z"
}
```

**Note:** 4xx errors from the target API are passed through directly to the client without wrapping.

### Unexpected Errors

#### `UNKNOWN_ERROR` (500)
**Error:** Proxy Error  
**Code:** UNKNOWN_ERROR  
**Message:** "Unexpected error: [error message]"  
**Cause:** An unexpected error occurred that doesn't fall into any other category

**Example Response:**
```json
{
  "error": "Proxy Error",
  "code": "UNKNOWN_ERROR",
  "message": "Unexpected error: Out of memory",
  "targetUrl": "https://api.example.com/endpoint",
  "statusCode": 500,
  "timestamp": "2025-11-03T12:34:56.789Z"
}
```

#### `INTERNAL_ERROR` (500)
**Error:** Internal Server Error  
**Message:** "Failed to process proxy request"  
**Cause:** An error occurred in the proxy routing logic before the request could be forwarded

---

## HTTP Status Code Summary

| Status Code | Description |
|------------|-------------|
| 400 | Bad Request - Invalid input parameters |
| 402 | Payment Required - Payment verification failed (handled by x402-hono) |
| 403 | Forbidden - API is inactive |
| 404 | Not Found - API or resource does not exist |
| 500 | Internal Server Error - Unexpected server error |
| 502 | Bad Gateway - Proxy error (cannot reach target API) |
| 503 | Service Unavailable - Target API is unavailable |
| 504 | Gateway Timeout - Target API did not respond in time |

---

## Successful Response Format

### Management API Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  // ... additional data
}
```

### Proxy Success Response

When the proxy successfully forwards a request, the response from the target API is returned with additional headers:

```
X-Proxy-By: P402
X-Proxy-Status: success
```

---

## Best Practices for API Consumers

1. **Always check the `code` field** for programmatic error handling
2. **Log the `timestamp`** for debugging proxy errors
3. **Inspect the `targetUrl`** to verify the request was routed correctly
4. **Handle 402 Payment Required** errors by providing valid payment credentials
5. **Retry on 502/503/504** errors with exponential backoff
6. **Do not retry on 400/403/404** errors - fix the request instead

---

## Example Error Handling (TypeScript)

```typescript
try {
  const response = await fetch('https://p402.workers.dev/api/xyz/endpoint');
  const data = await response.json();
  
  if (!response.ok) {
    switch (data.code) {
      case 'API_NOT_FOUND':
        console.error('API does not exist');
        break;
      case 'API_INACTIVE':
        console.error('API is deactivated');
        break;
      case 'TIMEOUT':
        console.error('Request timed out, retry later');
        break;
      case 'CONNECTION_REFUSED':
        console.error('Target API is down');
        break;
      default:
        console.error('Unknown error:', data.message);
    }
  }
} catch (error) {
  console.error('Network error:', error);
}
```

---

## Support

For additional support or to report issues with error handling, please refer to the project repository.


