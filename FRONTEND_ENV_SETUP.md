# Frontend Environment Setup Guide

## 📋 Environment Files

Frontend sử dụng các file `.env` khác nhau tùy theo environment:

```
.env                  ← Development (local)
.env.staging          ← Staging/Testing
.env.production       ← Production
.env.example          ← Template
```

## 🚀 Setup Instructions

### Local Development

1. **File hiện có:** `.env` (đã có)
   ```
   VITE_API_URL=http://localhost:5000
   ```

2. **Chạy frontend:**
   ```bash
   npm run dev
   ```

3. **Đảm bảo backend cũng chạy ở port 5000**

### Staging/Testing

1. **File:** `.env.staging`
   ```bash
   # Build với staging env
   npm run build -- --mode staging
   ```

2. **Cập nhật URL:**
   ```
   VITE_API_URL=https://your-staging-backend.app
   ```

### Production

1. **File:** `.env.production`
   ```bash
   # Build cho production
   npm run build
   ```

2. **Cập nhật URL với backend URL thực tế:**
   ```
   VITE_API_URL=https://your-production-backend.app
   ```

3. **Deploy frontend**

## 🔗 Backend URL Mapping

### Local Development
```
Frontend: http://localhost:5173  (Vite dev server)
Backend:  http://localhost:5000  (Node.js server)
```

### Deployed (Example: Vercel)

**Option 1: Same Organization**
```
Frontend: https://shopbanhoa.vercel.app
Backend:  https://shopbanhoa-api.vercel.app
VITE_API_URL=https://shopbanhoa-api.vercel.app
```

**Option 2: Different Services (Railway)**
```
Frontend: https://shopbanhoa-frontend.railway.app
Backend:  https://shopbanhoa-backend.railway.app
VITE_API_URL=https://shopbanhoa-backend.railway.app
```

## 📝 Common Backend URLs

### Vercel
```
https://your-project-name-api.vercel.app
```

### Railway
```
https://your-project-name.railway.app
```

### Render
```
https://your-project-name-backend.onrender.com
```

### AWS Lambda / Serverless
```
https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
```

## ✅ Testing Connection

1. **Check if API is reachable:**
   ```bash
   curl https://your-backend-url/api/health
   ```

2. **Browser console test:**
   - Open DevTools (F12)
   - Go to Console tab
   - Run:
     ```javascript
     fetch(process.env.REACT_APP_API_URL + '/api/health')
       .then(r => r.json())
       .then(console.log)
     ```

3. **Network tab check:**
   - Open DevTools Network tab
   - Make an API call
   - Check request URL is correct

## 🚨 Common Issues

### API URL Not Loading
- Check file exists: `.env` or `.env.production`
- Verify variable name: `VITE_API_URL` (not `REACT_APP_*`)
- Restart dev server after changing `.env`

### CORS Error
- Backend needs to allow frontend domain in CORS config
- Check backend CORS middleware:
  ```javascript
  app.use(cors());
  // or
  app.use(cors({ origin: 'https://frontend-domain.com' }));
  ```

### 404 Not Found
- Verify backend is running
- Check URL doesn't have trailing slash
- Test: `curl VITE_API_URL/api/health`

### Timeout
- Backend may be down
- Check deployment platform logs
- Verify IP/DNS is correct

## 📚 Vite Documentation
- https://vitejs.dev/guide/env-and-modes.html
- Environment variables must start with `VITE_` prefix

## 🔄 Deployment Checklist

- [ ] `.env.production` file created
- [ ] `VITE_API_URL` points to deployed backend
- [ ] Backend URL is publicly accessible
- [ ] Backend CORS allows frontend origin
- [ ] Run `npm run build` to test production build
- [ ] Deploy to hosting platform (Vercel, Netlify, etc.)
- [ ] Test API calls work in production
- [ ] Check DevTools Network tab for correct URLs
