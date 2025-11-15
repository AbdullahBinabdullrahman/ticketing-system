# Partner User Creation Guide

This guide explains how to create users for partners in the Ticketing System.

## Table of Contents
1. [Overview](#overview)
2. [Method 1: Create Partner with Initial User (Recommended)](#method-1-create-partner-with-initial-user-recommended)
3. [Method 2: Add Users to Existing Partner](#method-2-add-users-to-existing-partner)
4. [Method 3: Using Command Line Script](#method-3-using-command-line-script)
5. [API Endpoints](#api-endpoints)
6. [Features](#features)

---

## Overview

Partner users are accounts that allow partners to:
- Access the Partner Portal
- View and manage assigned service requests
- Update request statuses
- View performance metrics
- Manage their team members

---

## Method 1: Create Partner with Initial User (Recommended)

When creating a new partner through the Admin Portal, you can create the initial user account at the same time.

### Steps:

1. **Navigate to Partners Page**
   - Go to Admin Portal → Partners
   - Click "New Partner" button

2. **Fill Partner Information**
   ```
   Partner Name: [Company Name]
   Contact Email: [company@example.com]
   Contact Phone: [+966 XXX XXX XXX]
   Logo URL: [Optional logo URL]
   Status: Active
   ```

3. **Create Initial User Account**
   ```
   User Name: [Full Name]
   User Email: [user@company.com]
   User Phone: [Optional]
   Password: [Leave empty for auto-generation]
   Language Preference: English / Arabic
   Send Welcome Email: ✓ (Checked)
   ```

4. **Result**
   - Partner account is created
   - User account is created automatically
   - Welcome email is sent with login credentials
   - User can immediately log in to Partner Portal

### API Example:

```typescript
POST /api/admin/partners

{
  "name": "Acme Services",
  "contactEmail": "info@acme.com",
  "contactPhone": "+966501234567",
  "logoUrl": "https://example.com/logo.png",
  "status": "active",
  
  // Initial user details
  "userName": "Ahmed Ali",
  "userEmail": "ahmed@acme.com",
  "userPhone": "+966509876543",
  "userPassword": "", // Leave empty for auto-generation
  "sendWelcomeEmail": true
}
```

---

## Method 2: Add Users to Existing Partner

After a partner is created, you can add additional users through the Partner Portal or Admin Portal.

### Via Partner Portal (Partner Admin):

1. **Navigate to User Management**
   - Login to Partner Portal
   - Go to Profile → Users Tab
   - Click "Add User"

2. **Fill User Details**
   ```
   Name: [Full Name]
   Email: [user@company.com]
   Phone: [Optional]
   Preferred Language: English / Arabic
   ```

3. **Submit**
   - System generates secure password
   - Welcome email sent automatically
   - User can log in immediately

### Via Admin Portal:

1. **Navigate to Partner Details**
   - Admin Portal → Partners
   - Click on partner name
   - Go to "Users" tab
   - Click "Add User"

2. **Fill and Submit**
   - Same form as above
   - Creates user for selected partner

### API Example:

```typescript
POST /api/partner/users

{
  "name": "Fatima Hassan",
  "email": "fatima@acme.com",
  "phone": "+966501111111",
  "language": "ar"
}
```

**Or via Admin API:**

```typescript
POST /api/admin/partners/{partnerId}/users/create

{
  "name": "Fatima Hassan",
  "email": "fatima@acme.com",
  "phone": "+966501111111",
  "language": "ar",
  "sendWelcomeEmail": true
}
```

---

## Method 3: Using Command Line Script

For bulk operations or testing, you can use the command-line script.

### Script Location:
```
/scripts/create-partner-users.ts
```

### Usage:

```bash
# Interactive mode (prompts for input)
npx ts-node scripts/create-partner-users.ts

# Direct mode with parameters
npx ts-node scripts/create-partner-users.ts \
  --partnerId=1 \
  --name="Mohammed Salem" \
  --email="mohammed@partner.com" \
  --phone="+966501234567" \
  --language="ar" \
  --no-email

# Test mode (generates but doesn't send emails)
npx ts-node scripts/create-partner-users.ts --test
```

### Script Features:
- Lists available partners
- Validates email uniqueness
- Auto-generates secure passwords
- Optionally sends welcome emails
- Logs all actions

---

## API Endpoints

### Admin Endpoints

#### 1. Create Partner with User
```
POST /api/admin/partners
Authorization: Bearer {admin-token}

Body:
{
  "name": "Partner Name",
  "contactEmail": "contact@partner.com",
  "contactPhone": "+966...",
  "userName": "User Name",
  "userEmail": "user@partner.com",
  "sendWelcomeEmail": true
}
```

#### 2. Add User to Existing Partner
```
POST /api/admin/partners/{partnerId}/users/create
Authorization: Bearer {admin-token}

Body:
{
  "name": "User Name",
  "email": "user@partner.com",
  "phone": "+966...",
  "language": "en",
  "sendWelcomeEmail": true
}
```

### Partner Endpoints

#### 3. Create User (Partner Admin)
```
POST /api/partner/users
Authorization: Bearer {partner-token}

Body:
{
  "name": "New User",
  "email": "newuser@partner.com",
  "phone": "+966...",
  "language": "ar"
}
```

#### 4. List Partner Users
```
GET /api/partner/users
Authorization: Bearer {partner-token}

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "User Name",
      "email": "user@partner.com",
      "phone": "+966...",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 5. Update User
```
PUT /api/partner/users/{userId}
Authorization: Bearer {partner-token}

Body:
{
  "name": "Updated Name",
  "phone": "+966...",
  "isActive": true
}
```

---

## Features

### 🔐 Security Features

1. **Automatic Password Generation**
   - 12+ character passwords
   - Mix of uppercase, lowercase, numbers, and symbols
   - Cryptographically secure random generation

2. **Password Hashing**
   - bcrypt with salt rounds = 12
   - Industry-standard security

3. **Email Verification**
   - Auto-verified for partner users
   - Prevents login issues

### 📧 Email Notifications

Welcome emails include:
- User's full name
- Login email
- Temporary password
- Link to Partner Portal
- Support contact information
- Available in English and Arabic

### 🌍 Localization Support

- Language preference stored per user
- Portal UI switches based on preference
- Email notifications sent in user's language
- Supports: English (`en`), Arabic (`ar`)

### ✅ Validation

System validates:
- ✓ Partner exists and is active
- ✓ Email is unique (not already in use)
- ✓ Email format is valid
- ✓ Required fields are present
- ✓ Partner role exists in system

### 🔄 Automatic Features

- **Role Assignment**: Automatically assigned "partner" role
- **User Type**: Set to "partner" type
- **Status**: Created as active by default
- **Email Verification**: Auto-verified
- **Partner Linking**: Automatically linked to partner account

---

## Password Management

### Auto-Generated Passwords
When password is not provided, system generates:
```
Format: {random-chars}{Special}{Number}{Uppercase}
Example: xh2k9mwp3rT@1A
Length: 12-16 characters
```

### Manual Password Setting
```typescript
{
  "userPassword": "YourSecurePass123!"
}
```
**Note**: Manual passwords are only recommended for testing. For production, use auto-generation.

---

## Troubleshooting

### Issue: Email Already Exists
**Error**: "Email already exists"
**Solution**: Choose a different email or check if user was already created

### Issue: Welcome Email Not Sent
**Cause**: Email service configuration issue
**Impact**: User account is still created successfully
**Solution**: Check email service logs and manually send credentials

### Issue: Partner Not Found
**Error**: "Partner not found or inactive"
**Solution**: 
1. Verify partner exists
2. Check partner status is "active"
3. Ensure partner is not deleted

### Issue: User Cannot Login
**Checklist**:
1. ✓ User is active (`isActive = true`)
2. ✓ User is not deleted (`isDeleted = false`)
3. ✓ Using correct email address
4. ✓ Password is correct
5. ✓ Accessing Partner Portal (not Admin Portal)

---

## Best Practices

### 1. **Always Use Auto-Generated Passwords**
- More secure than user-chosen passwords
- Meets complexity requirements automatically

### 2. **Send Welcome Emails**
- Users receive credentials immediately
- Reduces support requests
- Professional onboarding experience

### 3. **Set Language Preference**
- Better user experience
- Portal displays in their language
- Emails sent in their language

### 4. **Verify Partner Information**
- Ensure partner details are correct before creating users
- Check contact email is valid
- Verify partner status is "active"

### 5. **Regular User Audits**
- Periodically review active users
- Deactivate unused accounts
- Update contact information

---

## Example Use Cases

### Use Case 1: New Partner Onboarding
```typescript
// Step 1: Create partner with initial admin user
const result = await fetch('/api/admin/partners', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "Quick Service Co.",
    contactEmail: "info@quickservice.com",
    contactPhone: "+966501234567",
    userName: "Admin User",
    userEmail: "admin@quickservice.com",
    sendWelcomeEmail: true
  })
});

// Result: Partner created + Admin user receives welcome email
```

### Use Case 2: Adding Team Members
```typescript
// Partner admin adds team member
const result = await fetch('/api/partner/users', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${partnerToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "Team Member",
    email: "member@quickservice.com",
    language: "ar"
  })
});

// Result: New user created + Welcome email sent
```

### Use Case 3: Bulk User Creation
```bash
# Create multiple users using script
for user in user1@partner.com user2@partner.com user3@partner.com; do
  npx ts-node scripts/create-partner-users.ts \
    --partnerId=1 \
    --email="$user" \
    --name="User" \
    --no-email
done
```

---

## Testing

### Test Partner User Creation

```bash
# 1. Start your development server
npm run dev

# 2. Test API endpoint
curl -X POST http://localhost:3000/api/partner/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@partner.com",
    "language": "en"
  }'

# 3. Check email logs
# Look in your terminal/logs for the generated password
```

---

## Support

For additional help:
- Check system logs: `/lib/utils/logger.ts`
- Review email service: `/services/emailService.ts`
- Partner user service: `/lib/services/partnerUserService.ts`
- API documentation: Check relevant API files in `/pages/api/`

---

## Summary

**Recommended Approach**: Use Method 1 or Method 2 via the UI

- ✅ User-friendly
- ✅ Automatic validation
- ✅ Welcome emails
- ✅ Error handling
- ✅ Audit logging

**For Bulk Operations**: Use Method 3 (Command Line Script)

- ✅ Fast for multiple users
- ✅ Scriptable/automatable
- ✅ Good for testing/development

---

**Last Updated**: November 2024
**Version**: 1.0



