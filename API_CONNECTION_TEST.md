# Frontend to Backend Connection Test

## Quick Start

### 1. Start Backend
```bash
cd backend
npm install
npm start
# Backend should run on http://localhost:5000
```

### 2. Start Frontend
```bash
# In another terminal
npm install
npm run dev
# Frontend should run on http://localhost:5173
```

### 3. Test Connection

**Method 1: Browser Console (Easiest)**

1. Open http://localhost:5173 in browser
2. Press `F12` to open DevTools
3. Go to Console tab
4. Paste and run:
   ```javascript
   // Test health endpoint
   fetch('http://localhost:5000/api/health')
     .then(r => r.json())
     .then(data => console.log('✅ Connected:', data))
     .catch(err => console.error('❌ Error:', err))
   
   // Test products endpoint
   fetch('http://localhost:5000/api/products')
     .then(r => r.json())
     .then(data => console.log('✅ Products:', data))
     .catch(err => console.error('❌ Error:', err))
   ```

**Method 2: Using cURL (Command Line)**

```bash
# Test health
curl http://localhost:5000/api/health

# Test products
curl http://localhost:5000/api/products

# Expected response
{"status":"ok"}
```

**Method 3: Check DevTools Network Tab**

1. Open http://localhost:5173
2. Open DevTools (F12) → Network tab
3. Try clicking on any product or navigating
4. Should see requests to `http://localhost:5000/api/*`
5. Check response status is 200, not CORS errors

## Troubleshooting

### ❌ Error: "No space left on device" / Connection refused

**Fix:**
```bash
# Check if port 5000 is in use
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process on port 5000 and restart backend
```

### ❌ Error: CORS not allowed

**Cause:** Backend CORS not configured for frontend origin

**Check:** Backend [backend/server.js](backend/server.js) line 8-20
```javascript
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    }
    // ...
  },
}));
```

**Fix:** Make sure `http://localhost:5173` is in `allowedOrigins`

### ❌ Error: Cannot GET /api/products (404)

**Cause:** Backend routes not loaded

**Check:**
1. Backend server is running
2. Routes exist in `backend/routes/`
3. Try: `curl http://localhost:5000/api/health` first

### ❌ VITE_API_URL not working

**Cause:** Environment variable not loaded

**Fix:**
1. Check `.env` file exists in root folder
2. Verify it contains: `VITE_API_URL=http://localhost:5000`
3. Restart dev server: `npm run dev`
4. Verify in console: `console.log(import.meta.env.VITE_API_URL)`

## Network Request Examples

### List Products
```bash
curl http://localhost:5000/api/products
# Response: [{ _id, name, price, ... }]
```

### Get Single Product
```bash
curl http://localhost:5000/api/products/<product-id>
# Response: { _id, name, price, image, ... }
```

### Create Order (Requires Auth)
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "items": [{"productId": "id", "quantity": 1}],
    "deliveryAddress": "123 Main St",
    "phone": "555-1234"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password"
  }'
# Response: { token: "...", user: {...} }
```

## Environment Variables

Current setup:
```
Local:       VITE_API_URL=http://localhost:5000
Staging:     VITE_API_URL=https://backend-staging.app
Production:  VITE_API_URL=https://backend-prod.app
```

## Deploy & Test

### After deploying backend to Vercel/Railway:

1. Update `.env.production`:
   ```
   VITE_API_URL=https://your-deployed-backend.app
   ```

2. Build & deploy frontend:
   ```bash
   npm run build
   # Deploy the dist/ folder
   ```

3. Test in browser:
   ```javascript
   // In DevTools console
   fetch(import.meta.env.VITE_API_URL + '/api/health')
     .then(r => r.json())
     .then(console.log)
   ```

## Help

If still having issues:
1. Check backend logs: `npm start`
2. Check frontend logs: DevTools Console
3. Check both are running: `localhost:5000` and `localhost:5173`
4. Verify network requests in DevTools Network tab
5. Check CORS headers in response
