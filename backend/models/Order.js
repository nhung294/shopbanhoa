const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  // Liên kết tới ID sản phẩm (Chuỗi 24 ký tự)
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  // Lưu lịch sử thông tin sản phẩm tại thời điểm mua
  productSnapshot: {
    name: { type: String, required: true },
    nameEn: String,
    price: { type: Number, required: true }, // Giá gốc lúc mua
    image: String,
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: [1, 'Số lượng tối thiểu là 1'] 
  },
  message: { type: String, default: '' },
});

const orderSchema = new mongoose.Schema({
  // Người đặt hàng
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true // Đánh index để truy vấn đơn hàng của tôi nhanh hơn
  },
  items: [orderItemSchema],
  totalPrice: { 
    type: Number, 
    required: true,
    min: 0 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'delivered'], 
    default: 'pending',
    index: true // Đánh index để Admin lọc trạng thái nhanh hơn
  },
  previousStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'delivered'],
    default: 'pending'
  },
  deliveryAddress: { type: String, required: true },
  phone: { type: String, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'payos'], 
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['not_paid', 'pending', 'completed', 'failed'],
    default: 'not_paid'
  },
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
}, { 
  timestamps: true // Tự động tạo createdAt, updatedAt
});

module.exports = mongoose.model('Order', orderSchema);