# Environment Variable Setup for Customer Token Security

## 🔒 Required Configuration

To enable the secure customer test token endpoint, you need to add **one new environment variable** to your `.env` file.

---

## ⚙️ Manual Setup Steps

### 1. Open your `.env` file
```bash
cd /Users/abdullah/ticketing-system
nano .env
# or use your preferred editor
```

### 2. Add this line to your `.env` file:

```env
# Next.js Public Environment Variable for Customer Test Token
# This MUST match your JWT_SECRET value
NEXT_PUBLIC_TEST_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 3. Copy your existing JWT_SECRET value

Find this line in your `.env`:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Copy the exact value** after `JWT_SECRET=`

### 4. Paste it as NEXT_PUBLIC_TEST_SECRET

```env
# Both should have the SAME value
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXT_PUBLIC_TEST_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 5. Save the file and restart your development server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## ✅ Complete Example

Your `.env` file should now contain:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ticketing_db

# JWT Secret Key (also used for test-token endpoint security)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Next.js Public Environment Variable (must match JWT_SECRET)
NEXT_PUBLIC_TEST_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@ticketing-system.com

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token

# Cron Job Security
CRON_SECRET=your-secure-cron-secret-key

# System Configuration
SYSTEM_USER_ID=1
EXTERNAL_CUSTOMER_ID=1
```

---

## 🎯 Why This Is Needed

### Security Flow

1. **Frontend (Browser):**
   - Reads `NEXT_PUBLIC_TEST_SECRET` from environment
   - Sends it in `X-Test-Secret` header when requesting test token

2. **Backend (API):**
   - Receives `X-Test-Secret` header
   - Compares it with `JWT_SECRET` from environment
   - ✅ Grants access if they match
   - ❌ Returns 401 if they don't match

### Why Two Variables?

- `JWT_SECRET` - Server-side only, not accessible in browser
- `NEXT_PUBLIC_TEST_SECRET` - Exposed to browser (Next.js requirement)

**Important:** Next.js only exposes variables with the `NEXT_PUBLIC_` prefix to the browser.

---

## 🧪 Testing the Setup

### 1. Restart your development server
```bash
npm run dev
```

### 2. Open customer portal
```
http://localhost:3000/customer/requests
```

### 3. Check browser console

**Success:**
```
✅ Test customer token generated automatically
```

**Failure (missing or wrong secret):**
```
❌ Failed to generate test token: Request failed with status code 401
```

### 4. Manual API Test

Test with cURL:
```bash
# Get your JWT_SECRET value from .env first
# Then run:

curl -X POST http://localhost:3000/api/customer/test-token \
  -H "X-Test-Secret: YOUR_JWT_SECRET_VALUE_HERE"

# Should return:
# {"token":"eyJ...","user":{...},"message":"Test customer token generated..."}
```

---

## 🚨 Common Issues

### Issue 1: "Failed to generate test token"
**Cause:** `NEXT_PUBLIC_TEST_SECRET` not set or doesn't match `JWT_SECRET`

**Solution:**
1. Verify both variables exist in `.env`
2. Ensure values are identical
3. Restart dev server

### Issue 2: Environment variable not loaded
**Cause:** Changes to `.env` require server restart

**Solution:**
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Issue 3: Still getting 401 Unauthorized
**Cause:** Old environment variables cached

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

---

## 🔐 Production Deployment

### ⚠️ Warning
This test endpoint with `NEXT_PUBLIC_TEST_SECRET` is for **DEVELOPMENT/TESTING ONLY**.

### For Production:

**Option 1: Disable the endpoint**
```typescript
// In pages/api/customer/test-token.ts
if (process.env.NODE_ENV === 'production') {
  return res.status(404).json({ message: "Not found" });
}
```

**Option 2: Remove the endpoint**
- Delete the file entirely
- Customers authenticate via mobile app only

**Option 3: Use IP whitelist**
- Only allow specific IPs to access
- Configure in production environment

### Production `.env` should NOT have:
```env
# ❌ Remove this in production:
# NEXT_PUBLIC_TEST_SECRET=...
```

---

## 📋 Verification Checklist

- [ ] Added `NEXT_PUBLIC_TEST_SECRET` to `.env`
- [ ] Value matches `JWT_SECRET` exactly
- [ ] Saved `.env` file
- [ ] Restarted development server
- [ ] Opened `http://localhost:3000/customer/requests`
- [ ] Saw "✅ Test customer token generated automatically" in console
- [ ] Can submit test requests successfully

---

## 🎉 You're All Set!

Once you've completed the steps above:
- The customer portal will automatically generate tokens
- The endpoint is secured with your secret key
- You can start testing the complete request journey

Visit: **http://localhost:3000/customer/requests** to begin! 🚀

---

## 📞 Need Help?

If you're still having issues:
1. Check that both environment variables exist
2. Verify they have the same value
3. Restart the development server
4. Check browser console for errors
5. Review `SECURITY_NOTES.md` for detailed security information




