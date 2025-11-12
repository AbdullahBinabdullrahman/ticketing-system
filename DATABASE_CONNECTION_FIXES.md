# Database Connection & Query Fixes

## Date: November 12, 2025

## Issues Fixed

### 1. PostgreSQL Enum Type Casting Error in Dashboard Stats
**File:** `pages/api/admin/dashboard/stats.ts`

**Problem:**
SQL queries were failing with enum validation errors because enum values weren't properly cast to their PostgreSQL enum type.

**Error Example:**
```
Failed query: select count(*) from "requests" where "requests"."status" IN ('submitted', 'unassigned')
```

**Solution:**
Added explicit enum type casting to all status comparisons:

```typescript
// ❌ Before (broken)
sql`${requests.status} IN ('submitted', 'unassigned')`

// ✅ After (fixed)
sql`${requests.status} IN ('submitted'::request_status_enum, 'unassigned'::request_status_enum)`
```

**Lines Fixed:**
- Line 95: Pending requests (assigned, confirmed, in_progress)
- Line 102: Unassigned requests (submitted, unassigned)
- Line 108: Completed requests (completed, closed)
- Line 116: Today's completed requests
- Line 196: Top partners by completed requests

---

### 2. Database Connection Timeout Issues
**File:** `lib/db/connection.ts`

**Problem:**
Database connections were timing out with error:
```
Error: write CONNECT_TIMEOUT aws-1-ap-southeast-2.pooler.supabase.com:5432
```

**Root Causes:**
1. No connection pooling configuration
2. No timeout settings
3. No connection cleanup handlers
4. No error suppression for notices

**Solution:**
Enhanced the postgres client configuration with proper connection management:

```typescript
export const client = postgres(connectionString, { 
  prepare: false,
  max: 10, // Maximum connections in pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 30, // Connection timeout in seconds
  max_lifetime: 60 * 30, // Max lifetime of connection (30 minutes)
  connection: {
    application_name: 'ticketing-system'
  },
  onnotice: () => {}, // Suppress notices
  debug: process.env.NODE_ENV === 'development' ? false : undefined,
});
```

**Added Features:**
- ✅ Connection pooling (max 10 connections)
- ✅ Idle connection timeout (20 seconds)
- ✅ Connection timeout increased to 30 seconds (from default 10)
- ✅ Max connection lifetime (30 minutes)
- ✅ Application name for easier monitoring
- ✅ Notice suppression
- ✅ Graceful shutdown handlers (SIGTERM, SIGINT)
- ✅ DATABASE_URL validation

---

## Testing

After applying these fixes, restart your Next.js development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

The dashboard should now load without errors, and database queries should execute successfully.

---

## Additional Notes

### Connection Pool Monitoring
The connection pool is configured with:
- **Max connections:** 10
- **Idle timeout:** 20 seconds
- **Connect timeout:** 30 seconds
- **Max lifetime:** 30 minutes

If you experience high traffic, you may need to increase the `max` connections limit.

### Supabase Considerations
Supabase has connection limits based on your plan:
- **Free plan:** 60 connections
- **Pro plan:** 200+ connections

Ensure your connection pool (`max: 10`) doesn't exceed your Supabase plan limits when running multiple instances.

### Error Handling
The connection now properly handles:
1. Missing DATABASE_URL environment variable
2. Connection timeouts
3. Graceful shutdown
4. Connection pool exhaustion

---

## Files Modified

1. `/pages/api/admin/dashboard/stats.ts`
   - Fixed 5 SQL queries with proper enum type casting

2. `/lib/db/connection.ts`
   - Enhanced connection configuration
   - Added connection pooling
   - Added timeout settings
   - Added cleanup handlers

---

## Verification Checklist

After restarting the server, verify:

- [ ] Login works successfully
- [ ] Dashboard loads without errors
- [ ] Dashboard stats display correctly
- [ ] No connection timeout errors in logs
- [ ] User sessions persist correctly
- [ ] API endpoints respond within expected time

---

## Related Documentation

- PostgreSQL Enum Types: https://www.postgresql.org/docs/current/datatype-enum.html
- postgres-js Documentation: https://github.com/porsager/postgres
- Drizzle ORM: https://orm.drizzle.team/docs/overview
- Supabase Connection Pooling: https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooling

