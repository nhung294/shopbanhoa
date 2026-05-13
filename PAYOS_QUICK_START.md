# 🚀 Quick Start - PayOS Payment Testing

## ⚡ 5 phút Setup

### 1️⃣ Cài đặt Dependencies
```bash
cd backend
npm install @payos/node@2.0.5
cd ..
npm install
```

### 2️⃣ Cấu hình Environment
File `backend/.env` đã có:
```env
PAYOS_CLIENT_ID=b524d7c7-931a-44af-9fcd-30b9ad0a835a
PAYOS_API_KEY=dd104848-e87a-4065-b410-22051e26c1d0
PAYOS_CHECKSUM_KEY=dd104848-e87a-4065-b410-22051e26c1d0
FRONTEND_URL=http://localhost:5173
```

### 3️⃣ Khởi động
```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Server chạy: http://localhost:5000

# Terminal 2 - Frontend
npm run dev
# App chạy: http://localhost:5173
```

---

## 🧪 Test Thanh Toán

### Test Flow Thanh toán Tiền mặt
```
1. Open: http://localhost:5173
2. Chọn sản phẩm → Thêm vào giỏ
3. Click "Thanh toán" (giỏ hàng)
4. Nhập địa chỉ & SĐT
5. Chọn "Thanh toán tiền mặt"
6. Click "Xác nhận đặt hàng"
✅ Expected: Redirect về dashboard
```

### Test Flow Thanh toán PayOS
```
1. Open: http://localhost:5173
2. Chọn sản phẩm → Thêm vào giỏ
3. Click "Thanh toán" (giỏ hàng)
4. Nhập địa chỉ & SĐT
5. Chọn "PayOS (Chuyển khoản QR)"
6. Click "Thanh toán qua PayOS"
✅ Expected: Redirect tới trang PayOS
⚠️ Note: Link tạm thời (24h), chỉ test flow
```

---

## 🔍 Kiểm tra API

### Get JWT Token
```bash
# 1. Register/Login để lấy token
# Hoặc check localStorage khi đã login

# Browser Console:
localStorage.getItem('token')
# Copy token này
```

### Test Create Payment Link
```bash
TOKEN="your_jwt_token"
ORDER_ID="66xxxxxxxxxxxxx"

curl -X POST http://localhost:5000/api/payos/payment-link \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"orderId\": \"$ORDER_ID\"}"

# Response:
{
  "checkoutUrl": "https://payos.vn/...",
  "paymentLinkId": "link_id",
  "orderCode": 123456
}
```

### Test Check Payment Status
```bash
TOKEN="your_jwt_token"
ORDER_ID="66xxxxxxxxxxxxx"

# From Database
curl http://localhost:5000/api/payos/payment-status/$ORDER_ID \
  -H "Authorization: Bearer $TOKEN"

# From PayOS API (Pull Status)
curl http://localhost:5000/api/payos/check-payment/$ORDER_ID \
  -H "Authorization: Bearer $TOKEN"

# Response:
{
  "orderId": "66xxxxx",
  "paymentStatus": "completed|pending|failed|not_paid",
  "paymentMethod": "cash|payos",
  "transactionId": "link_id",
  "completedAt": "2024-05-11T10:30:00Z"
}
```

### Test Get Orders
```bash
TOKEN="your_jwt_token"

curl http://localhost:5000/api/orders/my \
  -H "Authorization: Bearer $TOKEN"

# Response: Array of orders with payment status
```

---

## 🎯 Test PaymentStatus Component

### Scenario 1: View Payment Status
```
1. Order thanh toán qua PayOS
2. PayOS redirect: checkout?status=success&orderId=66xxxxx
3. Frontend hiển thị PaymentStatus component
4. Component auto-check mỗi 5 giây
✅ Status tự động update
```

### Scenario 2: Manual Check Status
```
1. Click "Kiểm tra lại" button
2. Component gọi: GET /api/payos/check-payment/:orderId
3. Backend pull từ PayOS API
4. Hiển thị trạng thái mới
```

### Scenario 3: Retry Payment
```
1. Payment thất bại
2. Click "Thử lại thanh toán" button
3. Redirect: checkout?retry=orderId
4. Tạo payment link mới
```

---

## 📊 Test OrderDashboard

```
1. Login: http://localhost:5173/login
2. Tạo 2-3 đơn hàng
   - 1 đơn tiền mặt
   - 2 đơn PayOS
3. Vào: http://localhost:5173/dashboard
4. Xem danh sách đơn hàng
✅ Hiển thị trạng thái thanh toán
✅ Hiển thị ngày thanh toán
✅ Hiển thị phương thức
```

---

## 🧬 Database Check

### Connect to MongoDB
```bash
# Sử dụng MongoDB Compass hoặc mongosh

# Query orders
db.orders.find().pretty()

# Find specific order
db.orders.findOne({ _id: ObjectId("66xxxxx") })

# Check payment status
db.orders.findOne({ 
  _id: ObjectId("66xxxxx") 
}).paymentStatus  // 'completed', 'pending', etc
```

### Check PayOS Transaction Info
```javascript
db.orders.findOne({ 
  'payosTransaction.transactionId': 'link_id' 
})

// Output:
{
  _id: ObjectId("66xxxxx"),
  paymentMethod: "payos",
  paymentStatus: "completed",
  payosTransaction: {
    transactionId: "link_id",
    completedAt: ISODate("2024-05-11T10:30:00Z"),
    checkoutUrl: "https://payos.vn/..."
  }
}
```

---

## 🐛 Debugging

### Backend Logs
Kiểm tra terminal backend (Terminal 1):
```
[PayOS] Creating payment link for order: 66xxxxx
[PayOS] Payment link created: link_id
[PayOS Webhook] Received webhook data
[PayOS Webhook] Verified data: { id: 'link_id', status: 'PAID' }
[PayOS Webhook] Order found, updating to completed: 66xxxxx
```

### Frontend Logs
Browser DevTools Console (F12):
```
// Check API response
console.log(await payosApi.checkPaymentStatus(orderId))

// Watch status updates
setInterval(() => {
  fetch(`/api/payos/check-payment/${orderId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json()).then(console.log)
}, 5000)
```

### Webhook Debug
```bash
curl -X POST http://localhost:5000/api/payos/webhook-debug \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "id": "link_id",
      "status": "PAID"
    },
    "signature": "xxx"
  }'
```

---

## ✅ Testing Checklist

- [ ] Backend startup
- [ ] Frontend startup
- [ ] Login
- [ ] Create order (COD)
- [ ] Check payment status endpoint
- [ ] Create order (PayOS)
- [ ] Redirect to PayOS
- [ ] View PaymentStatus component
- [ ] Auto-check status
- [ ] Manual check status
- [ ] View OrderDashboard
- [ ] Check database
- [ ] View logs

---

## 📱 Mobile Testing

### Test on Mobile Device
```
1. Ensure backend reachable from phone
2. Update FRONTEND_URL if needed
3. Access: http://your-ip:5173
4. Test payment flow
```

### Using Ngrok (for Public Testing)
```bash
# Terminal 3 - Ngrok
npm install -g ngrok
ngrok http 5000

# Output:
# https://xxx-xxx-xxx.ngrok.io

# Update backend .env:
# FRONTEND_URL=https://xxx-xxx-xxx.ngrok.io

# Setup webhook on PayOS:
# https://xxx-xxx-xxx.ngrok.io/api/payos/webhook
```

---

## 🚀 Next Steps

1. **Webhook Setup**
   - Configure webhook URL on PayOS Dashboard
   - Set events: Payment.Success, Payment.Cancelled

2. **Production Deploy**
   - Update domain in FRONTEND_URL
   - Enable HTTPS
   - Setup proper logging/monitoring

3. **Testing with Real Payments**
   - Use PayOS test account
   - Process test transactions
   - Verify webhook delivery

---

## 📞 Support

**Issues?**
1. Check backend logs
2. Check browser console
3. Check database
4. Review docs: PAYOS_STATUS_CHECKING.md

**Questions?**
- PayOS Docs: https://docs.payos.vn
- SDK Repo: https://github.com/payOSHQ/payos-lib-node

---

**Happy Testing! 🎉**

For detailed information, see:
- [PAYOS_SETUP.md](PAYOS_SETUP.md)
- [PAYOS_STATUS_CHECKING.md](docs/features/PAYOS_STATUS_CHECKING.md)
- [PAYOS_UPDATE_SUMMARY.md](PAYOS_UPDATE_SUMMARY.md)
