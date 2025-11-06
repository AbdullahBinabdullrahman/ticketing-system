# 🚀 Quick Reference: Creating Partner Users

## 📋 3 Ways to Create Partner Users

### 1️⃣ **When Creating New Partner (Recommended)**
**Location**: Admin Portal → Partners → New Partner

**Fields**:
```
✓ Partner Name
✓ Contact Email
✓ Contact Phone
---
✓ User Name
✓ User Email
☐ User Phone (optional)
☐ Password (leave empty = auto-generate)
✓ Send Welcome Email (check this!)
```

**Result**: Partner + User created, welcome email sent ✉️

---

### 2️⃣ **Add User to Existing Partner**

#### Option A: Partner Portal
**Location**: Partner Portal → Profile → Users → Add User

#### Option B: Admin Portal  
**Location**: Admin Portal → Partners → [Select Partner] → Users → Add User

**Fields**:
```
✓ Name
✓ Email
☐ Phone (optional)
✓ Language (en/ar)
```

**Result**: User created, welcome email sent ✉️

---

### 3️⃣ **Command Line (For Bulk/Testing)**

```bash
# Interactive mode
npx ts-node scripts/create-partner-users.ts

# Direct mode
npx ts-node scripts/create-partner-users.ts \
  --partnerId=1 \
  --name="User Name" \
  --email="user@partner.com" \
  --language="en"
```

---

## 🔑 API Endpoints Quick Reference

### Create Partner with User
```http
POST /api/admin/partners
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "name": "Partner Name",
  "contactEmail": "contact@partner.com",
  "userName": "User Name",
  "userEmail": "user@partner.com",
  "sendWelcomeEmail": true
}
```

### Add User to Partner (Partner API)
```http
POST /api/partner/users
Authorization: Bearer {partner-token}
Content-Type: application/json

{
  "name": "New User",
  "email": "user@partner.com",
  "phone": "+966...",
  "language": "ar"
}
```

### Add User to Partner (Admin API)
```http
POST /api/admin/partners/{partnerId}/users/create
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "name": "New User",
  "email": "user@partner.com",
  "language": "en",
  "sendWelcomeEmail": true
}
```

### List Partner Users
```http
GET /api/partner/users
Authorization: Bearer {partner-token}
```

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 🔐 **Auto Password** | 12+ chars, secure, random |
| 📧 **Welcome Email** | Credentials sent automatically |
| 🌍 **Language Support** | English / Arabic |
| ✅ **Auto-Verified** | No email verification needed |
| 🔗 **Auto-Linked** | Linked to partner automatically |
| 🛡️ **Secure Hash** | bcrypt, 12 salt rounds |

---

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| Email already exists | Use different email |
| Partner not found | Check partner is active |
| User can't login | Verify user is active |
| No welcome email | Check email logs (user still created) |

---

## 💡 Pro Tips

1. ✅ **Always auto-generate passwords** (more secure)
2. ✅ **Enable "Send Welcome Email"** (better UX)
3. ✅ **Set language preference** (localized experience)
4. ✅ **Use Method 1 for new partners** (one-step process)
5. ✅ **Use Partner Portal for team members** (self-service)

---

## 📞 Need Help?

- **Full Guide**: See `PARTNER_USER_CREATION_GUIDE.md`
- **Logs**: Check `/lib/utils/logger.ts`
- **Email Service**: `/services/emailService.ts`
- **User Service**: `/lib/services/partnerUserService.ts`

---

## 🎯 Quick Test

```bash
# Create test user
curl -X POST http://localhost:3000/api/partner/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@partner.com",
    "language": "en"
  }'
```

---

**Generated Password Format**: `xh2k9mwp3rT@1A` (random, 12+ chars)

**Default User Settings**:
- Role: `partner`
- Type: `partner`
- Status: `active`
- Email Verified: `true`
- Language: `en` (or specified)

---

**Last Updated**: November 2024

