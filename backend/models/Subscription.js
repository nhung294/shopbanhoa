const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  // Người đặt hàng
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  
  // Thông tin sản phẩm
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true
  },
  
  // Lưu snapshot thông tin sản phẩm lúc tạo subscription
  productSnapshot: {
    name: { type: String, required: true },
    nameEn: String,
    price: { type: Number, required: true },
    image: String,
  },
  
  // Số lượng mỗi lần giao
  quantity: { 
    type: Number, 
    required: true,
    min: [1, 'Số lượng tối thiểu là 1'],
    default: 1
  },
  
  // Tần suất giao hàng
  frequency: {
    type: String,
    enum: ['weekly', 'bi-weekly', 'monthly'],
    required: true
  },
  
  // Thông tin giao hàng
  deliveryAddress: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, default: '' }, // Lời nhắn giao cùng hoa
  
  // Giá mỗi lần giao
  price: { 
    type: Number, 
    required: true,
    min: 0 
  },
  
  // Trạng thái subscription
  status: { 
    type: String, 
    enum: ['active', 'paused', 'cancelled', 'expired'],
    default: 'active',
    index: true
  },
  
  // Ngày bắt đầu
  startDate: { 
    type: Date, 
    required: true,
    default: Date.now
  },
  
  // Ngày kết thúc (null = vĩnh viễn)
  endDate: { 
    type: Date, 
    default: null
  },
  
  // Ngày giao hàng tiếp theo
  nextDeliveryDate: { 
    type: Date, 
    required: true
  },
  
  // Ngày giao hàng cuối cùng thực tế
  lastDeliveryDate: { 
    type: Date, 
    default: null
  },
  
  // Tổng số đơn hàng đã tạo từ subscription này
  totalOrdersCreated: {
    type: Number,
    default: 0
  },
  
  // Phương thức thanh toán
  paymentMethod: {
    type: String,
    enum: ['credit-card', 'bank-transfer', 'cash-on-delivery'],
    default: 'credit-card'
  },
  
  // Ghi chú từ khách hàng
  notes: { type: String, default: '' },
  
  // Lý do tạm dừng/hủy
  cancellationReason: { type: String, default: '' },
  
}, { 
  timestamps: true
});

// Index cho tìm kiếm nhanh
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ nextDeliveryDate: 1, status: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
