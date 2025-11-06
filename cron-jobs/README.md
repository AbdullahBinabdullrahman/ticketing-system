# Ticketing System Cron Jobs

Standalone Node.js application for scheduled background tasks in the ticketing system.

## Overview

This application runs as a separate service that periodically calls API endpoints in the main Next.js application to perform background tasks. This architecture keeps the Next.js app stateless and serverless-friendly while handling time-sensitive operations.

## Jobs

### SLA Check (Every Minute)
- **Frequency**: Every minute (`* * * * *`)
- **Purpose**: Auto-unassign requests that exceed 15-minute SLA
- **Endpoint**: `POST /api/cron/sla-check`
- **Actions**:
  - Queries for expired assigned requests
  - Updates request status to `unassigned`
  - Records timeout in request history
  - Sends admin notification emails

## Setup

### 1. Install Dependencies

```bash
cd cron-jobs
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
API_BASE_URL=http://localhost:3000
CRON_SECRET=your-secure-random-secret-key-here
NODE_ENV=production
LOG_LEVEL=info
```

**Important**: The `CRON_SECRET` must match the value in your Next.js app's environment variables.

### 3. Run Locally

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Deployment Options

### Option 1: VPS with PM2 (Recommended)

1. Install PM2 globally:
```bash
npm install -g pm2
```

2. Start the application:
```bash
pm2 start index.js --name ticketing-cron
```

3. Save PM2 configuration:
```bash
pm2 save
```

4. Setup PM2 to start on system boot:
```bash
pm2 startup
```

5. Monitor logs:
```bash
pm2 logs ticketing-cron
```

### Option 2: Heroku Worker Dyno

1. Create a `Procfile`:
```
worker: node index.js
```

2. Deploy to Heroku:
```bash
heroku create your-app-cron
heroku config:set API_BASE_URL=https://your-app.vercel.app
heroku config:set CRON_SECRET=your-secret
git push heroku main
```

3. Scale worker dyno:
```bash
heroku ps:scale worker=1
```

### Option 3: Railway

1. Create new project on Railway
2. Connect your GitHub repository
3. Add environment variables in Railway dashboard
4. Deploy automatically on push

### Option 4: DigitalOcean App Platform

1. Create new app from GitHub
2. Select "Worker" as component type
3. Set run command: `node index.js`
4. Add environment variables
5. Deploy

### Option 5: Render Background Worker

1. Create new Background Worker
2. Connect repository
3. Set start command: `node index.js`
4. Add environment variables
5. Deploy

## Monitoring

### Health Check

The application doesn't expose an HTTP server by default. To monitor health:

1. **Check Logs**: Look for regular "SLA check completed" messages
2. **Exit Codes**: Process exits with code 1 on fatal errors
3. **Optional**: Add a simple HTTP health endpoint for monitoring tools

### Logs

The application logs all activities:
- `INFO`: Successful operations and unassignments
- `ERROR`: Failed API calls, unauthorized access, exceptions
- `DEBUG`: Every cron execution (set `LOG_LEVEL=debug`)

## Troubleshooting

### Issue: Unauthorized (401) Errors

**Cause**: CRON_SECRET mismatch between cron app and Next.js app

**Solution**: 
1. Verify `CRON_SECRET` matches in both `.env` files
2. Restart both applications after changing secrets

### Issue: Connection Refused

**Cause**: API_BASE_URL is incorrect or Next.js app is down

**Solution**:
1. Verify `API_BASE_URL` is correct
2. Test endpoint manually: `curl -X POST [API_BASE_URL]/api/cron/sla-check -H "x-cron-secret: YOUR_SECRET"`
3. Check Next.js app is running

### Issue: High CPU Usage

**Cause**: Too many requests or slow database queries

**Solution**:
1. Monitor database performance
2. Check for database index on `sla_deadline` field
3. Consider increasing cron interval if 1 minute is too frequent

## Security

1. **Secret Management**: Never commit `.env` to version control
2. **HTTPS Only**: Always use HTTPS for `API_BASE_URL` in production
3. **Firewall Rules**: Optionally restrict API endpoint access to cron server IP
4. **Monitoring**: Set up alerts for repeated failures or unauthorized access attempts

## Testing

### Test Locally

1. Start your Next.js app
2. Set `API_BASE_URL=http://localhost:3000` in `.env`
3. Run `npm start`
4. Watch logs for successful executions

### Test API Endpoint Manually

```bash
curl -X POST http://localhost:3000/api/cron/sla-check \
  -H "x-cron-secret: your-secret" \
  -H "Content-Type: application/json" \
  -v
```

Expected response:
```json
{
  "success": true,
  "unassignedCount": 0,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "durationMs": 45
}
```

## Architecture Notes

### Why Separate Application?

1. **Serverless Compatibility**: Next.js on Vercel is stateless - can't reliably run cron jobs
2. **Reliability**: Dedicated process ensures jobs run on schedule
3. **Scalability**: Can scale cron jobs independently from web app
4. **Monitoring**: Easier to monitor and debug background tasks
5. **Cost**: Can run on cheaper infrastructure (e.g., $5 VPS)

### Future Jobs

To add more cron jobs:

1. Add new schedule in `index.js`:
```javascript
cron.schedule('0 * * * *', async () => {
  // Your hourly job
});
```

2. Create corresponding API endpoint in Next.js
3. Document in this README

## Support

For issues or questions, please refer to the main project documentation or create an issue in the repository.


