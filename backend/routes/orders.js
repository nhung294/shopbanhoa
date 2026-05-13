const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');
const {
  applyOrderStatusStockChange,
  VALID_ORDER_STATUSES,
} = require('../utils/stock');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/orders
router.post('/', apiLimiter, protect, async (req, res) => {
  try {
    const { items, deliveryAddress, phone } = req.body;
    if (!items || !items.length)
      return res.status(400).json({ message: 'Đơn hàng phải có ít nhất một sản phẩm' });
    if (!deliveryAddress || !phone)
      return res.status(400).json({ message: 'Địa chỉ và số điện thoại là bắt buộc' });

    let calculatedTotalPrice = 0;
    const enrichedItems = [];

    for (const item of items) {
      const productId = String(item.productId || '');
      const quantity = Number(item.quantity);

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error(`Mã sản phẩm không hợp lệ: "${productId}"`);
      }

      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error(`Số lượng sản phẩm không hợp lệ cho ID ${productId}`);
      }

      const product = await Product.findById(productId);
      if (!product) {
        throw new Error(`Sản phẩm ID ${productId} không tồn tại`);
      }

      // Kiểm tra tồn kho nhưng không trừ khi tạo order
      // Stock sẽ được trừ khi admin chuyển trạng thái sang "delivered"
      if (product.stock < quantity) {
        throw new Error(
          `Sản phẩm "${product.name}" chỉ còn ${product.stock} cái. Bạn đặt ${quantity} cái.`
        );
      }

      calculatedTotalPrice += product.price * quantity;

      enrichedItems.push({
        product: product._id,
        productSnapshot: {
          name: product.name,
          nameEn: product.nameEn,
          price: product.price,
          image: product.image
        },
        quantity,
        message: item.message || '',
      });
    }

    // Tạo order mà không trừ kho (chờ admin xác nhận delivered)
    const order = await Order.create({
      user: req.user._id,
      items: enrichedItems,
      totalPrice: calculatedTotalPrice,
      deliveryAddress,
      phone,
    });
    
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/orders/my - Xem đơn hàng cá nhân
router.get('/my', apiLimiter, protect, async (req, res) => {
  try {
    // Thêm .lean() để tối ưu tốc độ tải
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders - Admin xem tất cả
router.get('/', apiLimiter, protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/orders/:id/status - Cập nhật trạng thái
router.patch('/:id/status', apiLimiter, protect, adminOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID đơn hàng không hợp lệ' });
    }
    
    const { status } = req.body;
    if (!VALID_ORDER_STATUSES.includes(status))
      return res.status(400).json({ message: 'Trạng thái đơn hàng không hợp lệ' });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    const oldStatus = order.status;

    await applyOrderStatusStockChange(order, status);

    // Cập nhật order: status và previousStatus (atomic)
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status,
        previousStatus: oldStatus
      },
      { new: true }
    ).populate('user', 'name email');

    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
