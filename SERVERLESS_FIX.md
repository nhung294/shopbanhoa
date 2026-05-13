# Serverless Deployment Fix

## Problem: "No exports found in module"

When deploying backend to serverless platforms (AWS Lambda, Vercel, Netlify), you might get:
```
No exports found in module "/var/task/backend/server.js"
Did you forget to export a function or a server?
```

## Solution Applied

### 1. ✅ Updated `backend/server.js`
- Now exports Express `app` for serverless platforms
- Keeps local development working
- Uses on-demand database connection middleware

### 2. ✅ Created `backend/handler.js`
- AWS Lambda handler wrapper
- Wraps Express app with `serverless-http`

### 3. ✅ Added `serverless-http` dependency
- Converts HTTP events to Express format
- Required for AWS Lambda, Netlify Functions

### 4. ✅ Created configuration files
- `vercel.json` - For Vercel deployment
- `backend/serverless.yml` - For AWS Lambda deployment

## Deployment Instructions by Platform

### **Vercel** (Easiest)

```bash
# Install dependencies
cd backend && npm install

# Deploy
vercel deploy
```

**Vercel Dashboard Setup:**
1. Settings → Environment Variables
2. Add all required variables:
   - MONGODB_URI
   - JWT_SECRET
   - PAYOS_CLIENT_ID
   - PAYOS_API_KEY
   - PAYOS_CHECKSUM_KEY
   - FRONTEND_URL
3. Redeploy

### **AWS Lambda + Serverless Framework**

```bash
# Install Serverless Framework
npm i -g serverless

# Configure AWS credentials
serverless config credentials --provider aws --key <key> --secret <secret>

# Install dependencies
cd backend && npm install

# Deploy
serverless deploy
```

**Environment Variables:**
Set in `.env.production` or via AWS Lambda console:
```
MONGODB_URI=...
JWT_SECRET=...
PAYOS_CLIENT_ID=...
PAYOS_API_KEY=...
PAYOS_CHECKSUM_KEY=...
FRONTEND_URL=...
```

### **Railway** (Recommended)

```bash
# Deploy from GitHub
# Railway auto-detects package.json in backend folder
# No special config needed
```

### **Render**

```bash
# Configure in Render Dashboard:
# Build Command: npm install
# Start Command: npm start
# Runtime: Node 18
```

## Database Connection Strategy

The updated server uses **on-demand connection** for serverless:

1. Database connects only when first request comes in
2. Connection is reused for subsequent requests (in same Lambda container)
3. Automatically handles cold starts

## Troubleshooting

### ❌ Still getting "No exports found"

1. Ensure `backend/server.js` has `module.exports = app;`
2. Verify `npm install` was run
3. Check deployment platform logs

### ❌ Database connection errors

1. Add deployment server IP to MongoDB Atlas whitelist
2. Verify MONGODB_URI in environment variables
3. Check if URI has correct format: `mongodb+srv://user:pass@cluster.mongodb.net/db`

### ❌ PayOS errors after deployment

1. Verify all PAYOS_* variables are set in platform
2. Check variable values have no extra spaces/quotes
3. PayOS API may have IP restrictions - whitelist deployment server

## Testing After Deployment

```bash
# Test health endpoint
curl https://your-backend.vercel.app/api/health

# Test with auth token
curl -H "Authorization: Bearer <token>" \
  https://your-backend.vercel.app/api/orders/my
```

## Notes

- Vercel is recommended for quickest setup
- AWS Lambda requires more configuration but offers better scalability
- All platforms support the fixed `server.js` structure
- Database should be MongoDB Atlas (cloud) not local
