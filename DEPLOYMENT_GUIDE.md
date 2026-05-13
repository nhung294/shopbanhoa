# Backend Deployment Guide

## Overview
Your backend requires environment variables for PayOS payment integration. Lỗi `FUNCTION_INVOCATION_FAILED` thường do thiếu hoặc sai cấu hình PayOS khi deploy.

## Environment Variables Required

```
MONGODB_URI=                  # MongoDB connection string (Atlas)
JWT_SECRET=                   # Secret key for JWT tokens
PAYOS_CLIENT_ID=             # PayOS Client ID (BẮTBUỘC)
PAYOS_API_KEY=               # PayOS API Key (BẮTBUỘC)
PAYOS_CHECKSUM_KEY=          # PayOS Checksum Key (BẮTBUỘC)
PORT=5000                    # Port number
NODE_ENV=production          # Environment (production/development)
SEED_ON_START=false          # Database seeding
FRONTEND_URL=                # Frontend URL for PayOS callbacks
```

## Deployment Platforms

### 1. **Vercel** (Recommended for Node.js)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

**Configure Environment Variables:**
1. Go to [vercel.com](https://vercel.com)
2. Select your project
3. Settings → Environment Variables
4. Add each variable:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `PAYOS_CLIENT_ID`
   - `PAYOS_API_KEY`
   - `PAYOS_CHECKSUM_KEY`
   - `FRONTEND_URL` (e.g., https://yourdomain.com)
5. Redeploy

### 2. **Railway.app**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Connect project
railway link

# Deploy
railway up
```

**Configure in Railway Dashboard:**
1. Go to your project
2. Variables tab
3. Add all required environment variables
4. Auto-redeploy on changes

### 3. **Render**

1. Connect GitHub repository
2. Create New → Web Service
3. Connect your repo
4. Fill in deploy settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Go to Environment tab
6. Add all required variables
7. Deploy

### 4. **Fly.io**

```bash
# Install Fly CLI
# https://fly.io/docs/getting-started/installing-flyctl/

fly auth login
fly launch
fly secrets set MONGODB_URI="..."
fly secrets set PAYOS_CLIENT_ID="..."
# ... set all other variables
fly deploy
```

## Testing After Deployment

```bash
# Test health endpoint
curl https://your-backend-url/api/health

# Check if PayOS is configured
curl -X POST https://your-backend-url/api/payos/payment-link \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"orderId": "test-id"}'
```

## Common Issues & Solutions

### Error: FUNCTION_INVOCATION_FAILED

**1. Check Environment Variables:**
```bash
# On deployment platform, verify all vars are set
# Should see:
✓ PAYOS_CLIENT_ID
✓ PAYOS_API_KEY  
✓ PAYOS_CHECKSUM_KEY
```

**2. Check Logs:**
- Vercel: Deployments → Select build → Function logs
- Railway: Logs tab
- Render: Logs
- Look for: "Missing PayOS configuration" message

**3. Verify PayOS Credentials:**
- Go to https://dashboard.payos.vn
- Check Client ID, API Key, Checksum Key
- Copy exact values (no extra spaces)
- Paste into deployment platform env vars
- Trigger redeploy

### Error: MongoDB connection failed

**1. Check Connection String:**
```bash
# Should be in format:
mongodb+srv://user:password@cluster.mongodb.net/dbname
```

**2. MongoDB Atlas IP Whitelist:**
1. Go to https://cloud.mongodb.com
2. Network Access → IP Whitelist
3. Add your deployment server IP:
   - Vercel: 0.0.0.0/0 (or specific IPs)
   - Railway: 0.0.0.0/0
   - Render: 0.0.0.0/0

### Error: JWT verification failed

**1. Ensure JWT_SECRET is set:**
```bash
# Should be a strong random string
JWT_SECRET=your_super_secret_key_at_least_32_chars_long
```

**2. Must be consistent across all instances**

## Production Checklist

- [ ] All environment variables set on deployment platform
- [ ] `NODE_ENV=production` is set
- [ ] CORS enabled for your frontend domain
- [ ] MongoDB Atlas whitelist updated
- [ ] PayOS credentials verified
- [ ] JWT_SECRET is secure and random
- [ ] Logs are being captured
- [ ] Test payment flow works end-to-end

## Monitoring

Set up error monitoring (optional but recommended):

```javascript
// Add to server.js for error tracking
// Example with Sentry:
const Sentry = require("@sentry/node");
Sentry.init({ dsn: process.env.SENTRY_DSN });
app.use(Sentry.Handlers.errorHandler());
```

## Support

For PayOS issues:
- Documentation: https://developers.payos.vn
- Status: https://status.payos.vn
- Contact: support@payos.vn
