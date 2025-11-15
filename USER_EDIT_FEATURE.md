# User Edit Feature Documentation

## Overview

Added the ability to edit user information in the admin panel. Users can now update user details including name, email, phone, role, language preference, and active status.

## Features Added

### 1. Backend API Endpoint

**File:** `/pages/api/admin/users/[id].ts`

- **GET** - Get user details by ID
- **PUT** - Update user information
- **DELETE** - Soft delete user

#### API Usage

**Update User:**
```bash
PUT /api/admin/users/{id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "updated@email.com",
  "phone": "+966501234567",
  "roleId": 1,
  "languagePreference": "en",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Updated Name",
      "email": "updated@email.com",
      ...
    }
  }
}
```

### 2. Frontend Components

**File:** `/pages/admin/users.tsx`

#### Added Components:
- ✅ Edit button in the users table
- ✅ Edit modal with form
- ✅ Form validation
- ✅ Success/error notifications

#### Edit Form Fields:
- **Name** - Required, minimum 2 characters
- **Email** - Required, valid email format
- **Phone** - Optional
- **Role** - Required, dropdown selection
- **Language Preference** - Required, English or Arabic
- **Active Status** - Checkbox

### 3. Hook Updates

**File:** `/hooks/useAdminUsers.ts`

- ✅ Added `useUpdateAdminUser()` hook
- ✅ Updated `AdminUser` interface to include new fields:
  - `partnerId`
  - `partnerName`
  - `emailVerifiedAt`
- ✅ Changed PUT request method from PATCH to PUT

### 4. Translation Updates

Added missing translations in both English and Arabic:

**English** (`/public/locales/en/common.json`):
- `users.editUser`: "Edit User"
- `users.activeStatus`: "User is active"
- `common.updating`: "Updating..."

**Arabic** (`/public/locales/ar/common.json`):
- `users.editUser`: "تعديل المستخدم"
- `users.activeStatus`: "المستخدم نشط"

## User Flow

1. **Admin navigates to Users page** (`/admin/users`)
2. **Clicks Edit button** (pencil icon) next to any user
3. **Edit modal opens** with pre-filled form data
4. **Admin updates desired fields**
5. **Clicks "Update" button**
6. **System validates** and updates the user
7. **Success notification** appears
8. **Modal closes** and user list refreshes

## Validation Rules

### Name
- Required
- Minimum 2 characters

### Email
- Required
- Valid email format
- Must be unique (checked on backend)

### Phone
- Optional
- Can be left empty

### Role
- Required
- Must be a valid role ID
- Must be either "admin" or "operational" role

### Language Preference
- Required
- Must be either "en" or "ar"

### Active Status
- Boolean
- Checked = Active
- Unchecked = Inactive

## Backend Service

**File:** `/lib/services/adminUserService.ts`

The `updateAdminUser` function handles:
- ✅ User validation (existence, active status)
- ✅ Email uniqueness check (if email is changed)
- ✅ Role validation
- ✅ Soft-delete prevention (only updates non-deleted users)
- ✅ Logging of all updates

## Security

- ✅ **Authentication Required** - Bearer token must be provided
- ✅ **Authorization Check** - Only admin users can edit
- ✅ **Input Validation** - Zod schema validation on API
- ✅ **Client-side Validation** - React Hook Form with Zod
- ✅ **Audit Trail** - All updates are logged

## Error Handling

### Client-side Errors:
- Form validation errors displayed inline
- Network errors shown as toast notifications
- Loading states prevent double-submission

### Server-side Errors:
- 401 - Unauthorized (missing/invalid token)
- 403 - Forbidden (not an admin user)
- 404 - User not found
- 400 - Validation error (invalid data)
- 409 - Email already exists

## UI/UX Features

- ✅ **Smooth animations** - Framer Motion transitions
- ✅ **Dark mode support** - Full theme support
- ✅ **RTL support** - Works with Arabic language
- ✅ **Mobile responsive** - Mobile-first design
- ✅ **Accessibility** - Semantic HTML and ARIA labels
- ✅ **Loading states** - Disabled buttons during submission
- ✅ **Keyboard navigation** - Tab through form fields

## Testing

### Manual Testing Steps:

1. **Test Edit Flow:**
   ```bash
   - Login as admin
   - Go to /admin/users
   - Click edit button on any user
   - Update fields
   - Submit
   - Verify changes appear
   ```

2. **Test Validation:**
   ```bash
   - Try to submit empty name
   - Try to submit invalid email
   - Try to submit duplicate email
   - Verify error messages appear
   ```

3. **Test API Directly:**
   ```bash
   curl -X PUT http://localhost:3000/api/admin/users/1 \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "isActive": true,
       "languagePreference": "en",
       "roleId": 1
     }'
   ```

## Files Changed

| File | Changes |
|------|---------|
| `pages/api/admin/users/[id].ts` | Created new API endpoint |
| `pages/admin/users.tsx` | Added edit button, modal, and handlers |
| `hooks/useAdminUsers.ts` | Added update hook and updated interfaces |
| `lib/services/adminUserService.ts` | Already had `updateAdminUser` function |
| `public/locales/en/common.json` | Added missing translations |
| `public/locales/ar/common.json` | Added missing translations |

## Known Limitations

1. **Cannot edit user type** - Partner users are shown but cannot be converted to admin users (by design)
2. **Cannot reset password** - Password reset is a separate feature
3. **No profile picture upload** - Not implemented yet
4. **Cannot change partner assignment** - Partner users' partnerId is immutable

## Future Enhancements

- [ ] Add password reset functionality in edit modal
- [ ] Add profile picture upload
- [ ] Add bulk edit capability
- [ ] Add user activity log view
- [ ] Add permission management per user
- [ ] Add email verification status toggle
- [ ] Add last login timestamp display

## Related Documentation

- [Admin Users Setup](./ADMIN_USERS_SETUP.md)
- [Changes Summary](./CHANGES_SUMMARY.md)
- [API Documentation](./ENV_VARS_DOCUMENTATION.md)

## Support

If you encounter any issues:
1. Check browser console for errors
2. Check server logs for API errors
3. Verify user has admin permissions
4. Ensure all environment variables are set
5. Try refreshing the page and clearing cache

---

**Status:** ✅ Complete and Ready for Use

**Version:** 1.0.0

**Last Updated:** November 8, 2024

