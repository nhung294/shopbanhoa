# Backend Deployment Troubleshooting Checklist

## Error: 500 INTERNAL_SERVER_ERROR - FUNCTION_INVOCATION_FAILED

### Possible Causes and Solutions

#### 1. **PayOS Configuration Issues** ⚠️ MOST LIKELY
- [ ] Verify `.env` file exists in `backend/` folder
- [ ] Check `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY` are set correctly
- [ ] Verify these keys match your PayOS account
- [ ] Ensure no extra spaces or quotes in `.env` values

**Current values in .env:**
```
PAYOS_CLIENT_ID=b524d7c7-931a-44af-9fcd-30b9ad0a835a
PAYOS_API_KEY=dd104848-e87a-4065-b410-22051e26c1d0
PAYOS_CHECKSUM_KEY=7ea04c78bd93c839833ab9012a6150abdc1cfce799fad0536d2e03e449e6548b
```

#### 2. **Database Connection**
- [ ] Verify `MONGODB_URI` is correct and accessible from deployment server
- [ ] Check MongoDB Atlas IP whitelist (add your deployment server IP)
- [ ] Test connection: `mongo <MONGODB_URI>`

#### 3. **Environment Variables Not Loaded**
- [ ] On deployment platform (Vercel, Railway, Render, etc.):
  - Add all backend environment variables to the platform's config
  - Ensure NODE_ENV is set (or not conflicting)
  - Redeploy after adding env vars

#### 4. **Missing Dependencies**
- [ ] Run: `npm install` in backend folder
- [ ] Check `package-lock.json` or `package.json` for all dependencies
- [ ] Verify `@payos/node@^2.0.5` is installed

#### 5. **Node.js Runtime Issues**
- [ ] Check Node.js version (recommended: 18+)
- [ ] Ensure async/await is properly handled in all routes
- [ ] Check for unhandled promise rejections

### Quick Debug Steps

1. **Test locally first:**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Check error logs on deployment platform:**
   - Vercel: Check Function logs
   - Railway: Check Deployment logs
   - Render: Check Deploy log & Runtime log

3. **Test PayOS specifically:**
   ```bash
   curl -X POST http://localhost:5000/api/payos/payment-link \
     -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"orderId": "<TEST_ORDER_ID>"}'
   ```

### Configuration Fixed in This Update
✅ Added environment variable validation in `backend/config/payos.js`
✅ Improved error logging in `backend/server.js`
✅ Enhanced error messages in `backend/routes/payos.js`
✅ Added async error wrapper utility

### Next Steps
1. Check deployment platform's environment variables section
2. Add all required `.env` variables to deployment config
3. Redeploy backend
4. Check logs for FUNCTION_INVOCATION_FAILED error details
