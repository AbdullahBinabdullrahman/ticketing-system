# Security Implementation Notes

## Customer Test Token Endpoint Security

### Overview
The `/api/customer/test-token` endpoint is now **secured with a secret key** to prevent unauthorized access.

---

## 🔒 How It Works

### Backend Protection
**File:** `pages/api/customer/test-token.ts`

The endpoint now requires:
- **Header:** `X-Test-Secret`
- **Value:** Must match `process.env.JWT_SECRET`

```typescript
// Request validation
const SECRET_KEY = process.env.JWT_SECRET;
const providedSecret = req.headers["x-test-secret"];

if (!providedSecret || providedSecret !== SECRET_KEY) {
  return 401 Unauthorized
}
```

### Frontend Implementation
**File:** `hooks/useCustomerAuth.ts`

The hook automatically includes the secret:
```typescript
const secret = process.env.NEXT_PUBLIC_TEST_SECRET;

axios.post("/api/customer/test-token", null, {
  headers: {
    "X-Test-Secret": secret,
  },
});
```

---

## ⚙️ Configuration

### Required Environment Variables

Add to your `.env` file:

```env
# JWT Secret Key (also used for test-token endpoint security)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Next.js Public Environment Variable (must match JWT_SECRET)
NEXT_PUBLIC_TEST_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Important:** Both values should be identical!

---

## 🛡️ Security Features

### 1. Secret Key Validation
- Endpoint validates `X-Test-Secret` header against `JWT_SECRET`
- Returns `401 Unauthorized` if secret is missing or invalid
- Logs unauthorized attempts with IP address

### 2. Environment-Based
- Secret comes from environment variables
- Not hardcoded in application code
- Can be changed per environment

### 3. Logging
```typescript
// Unauthorized attempts are logged
logger.warn("Unauthorized test token request - invalid secret", {
  ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
});
```

---

## 🧪 Testing

### Valid Request (Automatic)
When you visit `/customer/requests`:
```
→ Hook reads NEXT_PUBLIC_TEST_SECRET from env
→ Sends POST /api/customer/test-token with X-Test-Secret header
→ Server validates secret against JWT_SECRET
→ ✅ Token generated successfully
```

### Manual Testing (cURL)
```bash
# Valid request
curl -X POST http://localhost:3000/api/customer/test-token \
  -H "X-Test-Secret: your-super-secret-jwt-key-change-this-in-production"

# Response: 200 OK with token

# Invalid request (wrong secret)
curl -X POST http://localhost:3000/api/customer/test-token \
  -H "X-Test-Secret: wrong-secret"

# Response: 401 Unauthorized

# No secret header
curl -X POST http://localhost:3000/api/customer/test-token

# Response: 401 Unauthorized
```

---

## 🚨 Security Considerations

### For Development
✅ **Current Setup:** Secret in `.env` file
- Safe for local development
- Automatic token generation works
- Frontend can access via `NEXT_PUBLIC_TEST_SECRET`

### For Production

⚠️ **Important:** This endpoint is for **TESTING ONLY**

**Option 1: Disable the endpoint entirely**
```typescript
// In pages/api/customer/test-token.ts
if (process.env.NODE_ENV === 'production') {
  return res.status(404).json({ message: "Not found" });
}
```

**Option 2: Restrict to specific IPs**
```typescript
const ALLOWED_IPS = process.env.TEST_TOKEN_ALLOWED_IPS?.split(',') || [];
const clientIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

if (!ALLOWED_IPS.includes(clientIP)) {
  return res.status(403).json({ message: "Forbidden" });
}
```

**Option 3: Remove entirely**
- Delete `pages/api/customer/test-token.ts`
- Remove auto-generation from `hooks/useCustomerAuth.ts`
- Customers authenticate via mobile app only

---

## 🔐 Why NEXT_PUBLIC_TEST_SECRET?

### Next.js Environment Variables

**Server-side only:**
```env
JWT_SECRET=secret123
```
- Only available in API routes
- NOT accessible in browser

**Client-side accessible:**
```env
NEXT_PUBLIC_TEST_SECRET=secret123
```
- Available in browser via `process.env.NEXT_PUBLIC_TEST_SECRET`
- Required for frontend to send the secret
- Prefix `NEXT_PUBLIC_` exposes it to client

### Trade-off
- ✅ Convenient for testing
- ⚠️ Secret visible in browser
- 🛡️ Only use in development/test environments

---

## 📋 Production Checklist

Before deploying to production:

- [ ] Decide if test endpoint is needed
- [ ] If yes, implement IP whitelist
- [ ] If no, disable or remove endpoint
- [ ] Update environment variables
- [ ] Remove `NEXT_PUBLIC_TEST_SECRET` from production env
- [ ] Document customer authentication flow for mobile app
- [ ] Test that production customer flow works without test endpoint

---

## 🎯 Best Practices

### Development
```env
# .env.local (development)
JWT_SECRET=dev-secret-key-12345
NEXT_PUBLIC_TEST_SECRET=dev-secret-key-12345
```

### Testing/Staging
```env
# .env.staging
JWT_SECRET=staging-secret-key-67890
NEXT_PUBLIC_TEST_SECRET=staging-secret-key-67890
```

### Production
```env
# .env.production
JWT_SECRET=super-secure-production-key-change-me
# NEXT_PUBLIC_TEST_SECRET should NOT be set in production
```

---

## 🔍 Monitoring

### What to Monitor
1. **Failed authentication attempts:**
   - Check logs for "Unauthorized test token request"
   - Monitor IP addresses of failed attempts

2. **Token generation rate:**
   - Unusual spikes may indicate abuse
   - Implement rate limiting if needed

3. **Test customer activity:**
   - Track requests from test customer
   - Separate from real customer metrics

### Rate Limiting (Optional)
Consider adding rate limiting to prevent abuse:

```typescript
// Using express-rate-limit or similar
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
});

export default limiter(handler);
```

---

## 📞 Questions?

If you have questions about:
- Secret key management
- Production deployment
- Security hardening
- Alternative authentication methods

Please review this document and the implementation code.

---

**Security is layered.** This endpoint provides basic protection for development/testing. Additional measures should be taken for production deployments.




