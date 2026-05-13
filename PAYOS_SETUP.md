# 🎉 Hướng dẫn Cài đặt PayOS Payment Gateway

## 📋 Tổng quan
Ứng dụng Bloom Bright Artistry đã được tích hợp sẵn cổng thanh toán PayOS. Người dùng có thể thanh toán qua chuyển khoản QR hoặc tiền mặt khi nhận hàng.

## ✅ Thông tin PayOS

```
Client ID: b524d7c7-931a-44af-9fcd-30b9ad0a835a
API Key: dd104848-e87a-4065-b410-22051e26c1d0
Checksum Key: dd104848-e87a-4065-b410-22051e26c1d0
```

## 🚀 Các bước cài đặt

### 1️⃣ Cài đặt Dependencies

```bash
# Backend
cd backend
npm install @payos/node@2.0.5

# Frontend
cd ..
npm install
```

### 2️⃣ Cấu hình Environment Variables

Tạo/cập nhật file `backend/.env`:

```env
# Database
MONGODB_URI=mongodb+srv://nhug294_db_user:vn7RIMWOyVZ6MHA2@conangthugian.pdpvgbo.mongodb.net/?retryWrites=true&w=majority

# Server
PORT=5000
SEED_ON_START=false

# JWT
JWT_SECRET=your_jwt_secret_here

# PayOS Configuration
PAYOS_CLIENT_ID=b524d7c7-931a-44af-9fcd-30b9ad0a835a
PAYOS_API_KEY=dd104848-e87a-4065-b410-22051e26c1d0
PAYOS_CHECKSUM_KEY=dd104848-e87a-4065-b410-22051e26c1d0

# Frontend URL (for PayOS return URL)
FRONTEND_URL=http://localhost:5173
```

### 3️⃣ Khởi động ứng dụng

#### Terminal 1 - Backend:
```bash
cd backend
npm run dev
# Server sẽ chạy tại: http://localhost:5000
```

#### Terminal 2 - Frontend:
```bash
npm run dev
# Frontend sẽ chạy tại: http://localhost:5173
```

## 📱 Quy trình thanh toán

### Thanh toán tiền mặt (COD)
1. ✅ User thêm sản phẩm vào giỏ
2. ✅ Nhấn "Thanh toán" → Trang Checkout
3. ✅ Chọn "Thanh toán tiền mặt khi nhận hàng"
4. ✅ Nhập địa chỉ và số điện thoại
5. ✅ Nhấn "Xác nhận đặt hàng"
6. ✅ Đơn hàng được tạo với trạng thái: `paymentStatus = 'not_paid'`

### Thanh toán PayOS (QR)
1. ✅ User thêm sản phẩm vào giỏ
2. ✅ Nhấn "Thanh toán" → Trang Checkout
3. ✅ Chọn "PayOS (Chuyển khoản QR)"
4. ✅ Nhập địa chỉ và số điện thoại
5. ✅ Nhấn "Thanh toán qua PayOS"
6. ✅ **Redirect tới trang thanh toán PayOS**
7. ✅ Quét QR hoặc nhập chi tiết tài khoản
8. ✅ Sau khi thanh toán thành công:
   - Redirect về trang Checkout với `status=success`
   - Webhook từ PayOS cập nhật `paymentStatus = 'completed'`

## 📊 Cấu trúc Database - Order Model

```javascript
{
  // Người đặt hàng
  user: ObjectId,
  
  // Sản phẩm
  items: [{
    product: ObjectId,
    productSnapshot: {
      name: String,
      price: Number,
      image: String,
    },
    quantity: Number,
    message: String,
  }],
  
  // Thông tin giao hàng
  totalPrice: Number,
  status: 'pending' | 'approved' | 'rejected' | 'delivered',
  deliveryAddress: String,
  phone: String,
  
  // Thông tin thanh toán ⭐ MỚI
  paymentMethod: 'cash' | 'payos',
  paymentStatus: 'not_paid' | 'pending' | 'completed' | 'failed',
  payosTransaction: {
    transactionId: String,
    referenceId: String,
    amount: Number,
    currency: String,
    paymentLinkId: String,
    checkoutUrl: String,
    createdAt: Date,
    completedAt: Date,
  },
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
}
```

## 🔌 API Endpoints

### 1. Tạo Payment Link
```
POST /api/payos/payment-link
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "orderId": "66xxxxxxxxxxxxx"
}

Response: {
  "checkoutUrl": "https://payos.vn/...",
  "paymentLinkId": "id",
  "orderCode": 123456
}
```

### 2. Webhook (PayOS → Backend)
```
POST /api/payos/webhook

Payload từ PayOS:
{
  "data": {
    "id": "transaction_id",
    "status": "PAID" | "CANCELLED" | "FAILED"
  },
  "signature": "..."
}
```

### 3. Kiểm tra Trạng thái Thanh toán
```
GET /api/payos/payment-status/:orderId
Authorization: Bearer YOUR_JWT_TOKEN

Response: {
  "orderId": "66xxxxxxxxxxxxx",
  "paymentStatus": "completed",
  "paymentMethod": "payos",
  "transactionId": "payos_transaction_id"
}
```

## 🛠 Frontend Integration

### Trong Component Checkout.tsx

```typescript
import { payosApi } from '@/lib/api';

// Tạo payment link
const paymentData = await payosApi.createPaymentLink(orderId);
window.location.href = paymentData.checkoutUrl;

// Kiểm tra trạng thái
const status = await payosApi.getPaymentStatus(orderId);
console.log(status.paymentStatus); // 'completed', 'pending', 'failed', 'not_paid'
```

### Xử lý Return URL từ PayOS

Sau khi thanh toán, PayOS sẽ redirect về:
```
http://localhost:5173/checkout?status=success&orderId=xxx
hoặc
http://localhost:5173/checkout?status=cancel&orderId=xxx
```

Frontend tự động xử lý:
- `status=success` → Hiển thị thông báo thành công, redirect về dashboard
- `status=cancel` → Hiển thị lỗi "Thanh toán đã bị hủy"

## 🔐 Cấu hình Webhook trên PayOS Dashboard

1. Đăng nhập vào **[Dashboard PayOS](https://payos.vn/)**
2. Vào mục **Cài đặt → Webhook**
3. Thêm Webhook URL:
   ```
   Production: https://your-domain.com/api/payos/webhook
   Development: Sử dụng ngrok để expose local server
   ```
4. Chọn các event:
   - ✅ Payment.Success (PAID)
   - ✅ Payment.Cancelled
   - ✅ Payment.Failed
5. Nhấn **Lưu**

### Sử dụng Ngrok cho Development
```bash
# Cài đặt ngrok
npm install -g ngrok

# Chạy ngrok
ngrok http 5000

# Output: https://xxxx-xx-xxx-xxx-xx.ngrok.io

# Webhook URL:
https://xxxx-xx-xxx-xxx-xx.ngrok.io/api/payos/webhook
```

## 🧪 Testing

### Test Tạo Payment Link
```bash
curl -X POST http://localhost:5000/api/payos/payment-link \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId": "66xxxxxxxxxxxxx"}'
```

### Test Kiểm tra Trạng thái
```bash
curl http://localhost:5000/api/payos/payment-status/66xxxxxxxxxxxxx \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📁 File Thay đổi

| File | Thay đổi |
|------|----------|
| `backend/config/payos.js` | **✨ Mới** - Cấu hình PayOS |
| `backend/routes/payos.js` | **✨ Mới** - API endpoints thanh toán |
| `backend/models/Order.js` | 📝 Thêm fields: `paymentMethod`, `paymentStatus`, `payosTransaction` |
| `backend/server.js` | 📝 Thêm route: `app.use('/api/payos', require('./routes/payos'))` |
| `backend/.env` | 📝 Thêm PayOS credentials |
| `backend/package.json` | 📝 Thêm dependency: `@payos/node@2.0.5` |
| `src/lib/api.ts` | 📝 Thêm `payosApi` object |
| `src/pages/Checkout.tsx` | 📝 Thêm lựa chọn phương thức thanh toán |
| `docs/features/payos-payment.md` | **✨ Mới** - Tài liệu chi tiết |

## 🐛 Troubleshooting

### ❌ "Failed to create payment link"
- Kiểm tra PayOS credentials trong `.env`
- Kiểm tra Order tồn tại và có items
- Kiểm tra MongoDB connection

### ❌ "Webhook verification failed"
- Đảm bảo `PAYOS_CHECKSUM_KEY` đúng
- Kiểm tra webhook URL trên PayOS dashboard
- Kiểm tra logs từ server

### ❌ "Redirect không hoạt động"
- Kiểm tra `FRONTEND_URL` trong `.env`
- Kiểm tra `checkoutUrl` từ API response có hợp lệ không

### ❌ "Transaction not found"
- Kiểm tra `payosTransaction.transactionId` trong database
- Đảm bảo webhook được gửi chính xác từ PayOS

## 📖 Tài liệu Tham khảo

- [PayOS Official Docs](https://docs.payos.vn)
- [PayOS Node SDK GitHub](https://github.com/payOSHQ/payos-lib-node)
- [Chi tiết tích hợp: `docs/features/payos-payment.md`](docs/features/payos-payment.md)

## 💡 Ghi chú

- PayOS hiện hỗ trợ các phương thức thanh toán: **Chuyển khoản QR, Ngân hàng, Mobile wallet**
- Mỗi payment link có hạn: **24 giờ** hoặc khi bị hủy
- Webhook sẽ retry tối đa **3 lần** nếu không nhận được response `200 OK`
- Production cần HTTPS để nhận webhook từ PayOS

## ✨ Tính năng

✅ Tạo payment link qua PayOS SDK
✅ Webhook xác minh từ PayOS
✅ Lưu trữ transaction ID và trạng thái
✅ Hỗ trợ cả thanh toán tiền mặt (COD) và PayOS
✅ Redirect an toàn sau thanh toán
✅ Kiểm tra trạng thái thanh toán real-time

---

**Chúc bạn triển khai thành công! 🚀**

Nếu có vấn đề, vui lòng kiểm tra logs:
- Backend: `console.log` trong terminal
- Frontend: Browser DevTools Console (F12)
- PayOS Dashboard: Logs section
