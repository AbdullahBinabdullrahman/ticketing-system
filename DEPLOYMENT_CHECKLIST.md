# Deployment Checklist

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Setup

#### Next.js App (Vercel)
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `JWT_SECRET` - Authentication secret
- [ ] `BREVO_API_KEY` - Email service API key
- [ ] `SENDER_EMAIL` - From email address
- [ ] `SENDER_NAME` - From name
- [ ] `ADMIN_EMAIL` - Admin notification email
- [ ] `CRON_SECRET` - **NEW** - Secret for cron authentication
- [ ] `SYSTEM_USER_ID` - **NEW** - System user ID (usually 1)
- [ ] `EXTERNAL_CUSTOMER_ID` - **NEW** - External customer ID (usually 1)
- [ ] `NEXT_PUBLIC_MAPBOX_TOKEN` - Mapbox access token
- [ ] `NEXT_PUBLIC_APP_URL` - Application URL
- [ ] `NODE_ENV=production`

#### Cron Jobs App
- [ ] `API_BASE_URL` - Your Next.js app URL (e.g., https://your-app.vercel.app)
- [ ] `CRON_SECRET` - **Must match Next.js app secret**
- [ ] `NODE_ENV=production`
- [ ] `LOG_LEVEL=info`

### 2. Database Setup
- [ ] Database schema is up to date
- [ ] Seed data is loaded
- [ ] System user (ID 1) exists
- [ ] External customer user (ID 1) exists
- [ ] Test with sample data
- [ ] Database indexes are created
- [ ] Verify `idx_requests_sla_deadline` index exists

### 3. Code Quality
- [ ] All TypeScript errors fixed
- [ ] All linting warnings resolved
- [ ] No console.log in production code
- [ ] Error handling implemented
- [ ] Logging properly configured

### 4. Testing
- [ ] Local testing completed
- [ ] SLA endpoint tested (see TESTING_GUIDE.md)
- [ ] Admin request creation tested
- [ ] Database integration verified
- [ ] Email notifications tested
- [ ] End-to-end flow tested

---

## 🚀 Deployment Steps

### Phase 1: Deploy Next.js App

#### Step 1: Update Vercel Environment Variables
```bash
# Using Vercel CLI
vercel env add CRON_SECRET
vercel env add SYSTEM_USER_ID
vercel env add EXTERNAL_CUSTOMER_ID

# Or via Vercel Dashboard:
# 1. Go to Project Settings
# 2. Navigate to Environment Variables
# 3. Add the three new variables
# 4. Select all environments (Production, Preview, Development)
```

#### Step 2: Deploy to Vercel
```bash
# Option A: Git push (automatic deployment)
git add .
git commit -m "feat: add auto-unassign SLA and admin request creation"
git push origin main

# Option B: Manual deployment
vercel --prod
```

#### Step 3: Verify Deployment
- [ ] Visit your app URL
- [ ] Test login
- [ ] Navigate to `/admin/requests/new`
- [ ] Verify Create Request link in sidebar
- [ ] Check all translations load (EN/AR)

#### Step 4: Test API Endpoint
```bash
# Replace with your actual values
export API_URL=https://your-app.vercel.app
export CRON_SECRET=your-secret

./scripts/test-sla-endpoint.sh production
```

Expected: All tests pass ✅

---

### Phase 2: Deploy Cron Jobs App

#### Choose Your Hosting Option:

##### Option A: VPS with PM2 (Recommended) ⭐

**Requirements:**
- Ubuntu/Debian VPS (DigitalOcean, Linode, AWS EC2, etc.)
- Minimum: 1 GB RAM, 1 vCPU
- SSH access

**Steps:**

1. **Connect to VPS**
```bash
ssh user@your-vps-ip
```

2. **Install Node.js**
```bash
# Install Node.js 18+ (using NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

3. **Upload Cron Jobs App**
```bash
# Option A: Using Git (recommended)
cd /var/www  # or your preferred location
git clone https://github.com/your-repo/ticketing-system.git
cd ticketing-system/cron-jobs

# Option B: Using SCP
# On your local machine:
scp -r cron-jobs/ user@your-vps-ip:/var/www/ticketing-cron/
```

4. **Install Dependencies**
```bash
cd /var/www/ticketing-system/cron-jobs  # or your path
npm install --production
```

5. **Configure Environment**
```bash
cp .env.example .env
nano .env

# Set these values:
API_BASE_URL=https://your-app.vercel.app
CRON_SECRET=your-secret-from-vercel
NODE_ENV=production
LOG_LEVEL=info
```

6. **Install PM2**
```bash
sudo npm install -g pm2
```

7. **Start Application**
```bash
pm2 start index.js --name ticketing-cron
pm2 save
pm2 startup  # Follow the command it outputs
```

8. **Verify Running**
```bash
pm2 status
pm2 logs ticketing-cron --lines 50
```

Expected output:
```
🚀 Ticketing System Cron Jobs Started
=====================================
📍 API Base URL: https://your-app.vercel.app
⏰ SLA Check: Runs every minute
...
[INFO] SLA check completed - Unassigned 0 request(s)
```

9. **Setup Monitoring**
```bash
# View real-time logs
pm2 logs ticketing-cron

# Monitor CPU/memory
pm2 monit

# Set up log rotation
pm2 install pm2-logrotate
```

10. **Firewall (Optional but Recommended)**
```bash
# Allow SSH and outbound HTTP/HTTPS
sudo ufw allow OpenSSH
sudo ufw enable
```

---

##### Option B: Railway

**Steps:**

1. **Create Railway Account** at railway.app

2. **Create New Project**
   - Click "New Project"
   - Select "Empty Project"

3. **Add Service**
   - Click "New" → "Empty Service"
   - Name it "ticketing-cron"

4. **Deploy from GitHub**
   - Connect your GitHub repository
   - Set root directory: `cron-jobs`

5. **Configure Environment Variables**
   - Go to Variables tab
   - Add:
     - `API_BASE_URL`
     - `CRON_SECRET`
     - `NODE_ENV=production`

6. **Configure Start Command**
   - Go to Settings
   - Set Start Command: `node index.js`

7. **Deploy**
   - Railway will auto-deploy
   - Check logs for successful startup

---

##### Option C: Heroku Worker Dyno

**Steps:**

1. **Create Procfile in `/cron-jobs/`**
```bash
echo "worker: node index.js" > cron-jobs/Procfile
```

2. **Create Heroku App**
```bash
cd cron-jobs
heroku create your-app-cron
```

3. **Set Environment Variables**
```bash
heroku config:set API_BASE_URL=https://your-app.vercel.app
heroku config:set CRON_SECRET=your-secret
heroku config:set NODE_ENV=production
```

4. **Deploy**
```bash
git init  # if not already a git repo
git add .
git commit -m "Deploy cron jobs"
heroku git:remote -a your-app-cron
git push heroku main
```

5. **Scale Worker**
```bash
heroku ps:scale worker=1
```

6. **Check Logs**
```bash
heroku logs --tail
```

---

## ✅ Post-Deployment Verification

### 1. Verify Cron Job is Running

#### Check Logs
```bash
# VPS with PM2
pm2 logs ticketing-cron --lines 50

# Railway
# Go to Dashboard → Logs

# Heroku
heroku logs --tail --app your-app-cron
```

Expected: Logs every minute showing SLA checks

#### Check API Calls
```bash
# Call API directly
curl -X POST https://your-app.vercel.app/api/cron/sla-check \
  -H "x-cron-secret: your-secret" \
  -H "Content-Type: application/json"
```

Expected: 200 OK response

### 2. Verify Admin Request Creation

1. Visit `https://your-app.vercel.app/admin/requests/new`
2. Fill form and submit
3. Verify request created
4. Check database

### 3. End-to-End SLA Test

1. Create and assign a test request
2. Manually expire SLA in database:
```sql
UPDATE requests
SET sla_deadline = NOW() - INTERVAL '5 minutes'
WHERE id = <test_request_id>;
```
3. Wait 1 minute for cron to run
4. Verify request unassigned
5. Check admin email received

### 4. Monitoring Setup

#### Set Up Alerts

**VPS:**
```bash
# Install monitoring (optional)
pm2 install pm2-server-monit
```

**Uptime Monitoring:**
- Use services like:
  - UptimeRobot (free)
  - Pingdom
  - Better Uptime

**Configure to ping:**
```
URL: https://your-app.vercel.app/api/health
Interval: 5 minutes
```

#### Check Logs Daily
- First week: Check daily
- After stable: Check weekly
- Set up log aggregation (e.g., Papertrail, Logtail)

---

## 🔧 Rollback Plan

### If Issues After Deployment

#### Next.js App
```bash
# Revert to previous deployment
vercel rollback
```

#### Cron Jobs App

**VPS:**
```bash
pm2 stop ticketing-cron
pm2 delete ticketing-cron
# Restore previous version and restart
```

**Railway/Heroku:**
- Use dashboard to rollback to previous deployment

---

## 📊 Success Criteria

After deployment, verify:

- [ ] Cron job running continuously (check logs)
- [ ] SLA checks execute every minute
- [ ] Expired requests are auto-unassigned
- [ ] Admin can create requests via UI
- [ ] Email notifications are sent
- [ ] No errors in logs
- [ ] Application performance is good
- [ ] Database is not overloaded

---

## 🆘 Troubleshooting

### Cron Job Not Running
- Check environment variables
- Verify API_BASE_URL is correct
- Check network connectivity
- Look for errors in logs

### 401 Unauthorized Errors
- Verify CRON_SECRET matches exactly
- Check case sensitivity
- Ensure no extra spaces in secret

### No Requests Being Unassigned
- Verify cron is calling API successfully
- Check database for expired requests
- Verify SYSTEM_USER_ID exists
- Check database logs

### High Memory/CPU Usage
- Check for memory leaks
- Verify cron schedule (should be every minute)
- Monitor database performance
- Check for stuck processes

---

## 📞 Support Contacts

**Critical Issues:**
- Check logs first
- Review TESTING_GUIDE.md
- Review IMPLEMENTATION_SUMMARY.md

**Deployment Help:**
- VPS: SSH into server and check PM2 logs
- Railway: Check dashboard logs
- Vercel: Check function logs in dashboard

---

## ✨ Deployment Complete!

Once all checkboxes are ✅, your system is production-ready!

Monitor for the first 24 hours and adjust as needed.

**Good luck! 🚀**




