const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const { reserveStock, releaseStock } = require('../utils/stock');

// Helper function: Tính ngày giao hàng tiếp theo
const calculateNextDeliveryDate = (currentDate, frequency) => {
  const next = new Date(currentDate);
  switch(frequency) {
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'bi-weekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
  }
  return next;
};

// ===== TẠO SUBSCRIPTION MỚI =====
router.post('/', auth, async (req, res) => {
  try {
    const { productId, quantity, frequency, deliveryAddress, phone, message, paymentMethod, endDate, notes } = req.body;

    // Validate
    if (!productId || !quantity || !frequency || !deliveryAddress || !phone) {
      return res.status(400).json({ error: 'Thông tin không đầy đủ' });
    }

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Sản phẩm không tìm thấy' });
    }

    // Tính ngày giao hàng tiếp theo
    const nextDeliveryDate = calculateNextDeliveryDate(new Date(), frequency);

    // Tạo subscription
    const subscription = new Subscription({
      user: req.user.id,
      product: productId,
      productSnapshot: {
        name: product.name,
        nameEn: product.nameEn,
        price: product.price,
        image: product.image,
      },
      quantity,
      frequency,
      deliveryAddress,
      phone,
      message: message || '',
      price: product.price * quantity,
      paymentMethod: paymentMethod || 'credit-card',
      nextDeliveryDate,
      endDate: endDate ? new Date(endDate) : null,
      notes: notes || '',
    });

    await subscription.save();
    await subscription.populate('product');

    res.status(201).json({
      message: 'Tạo đơn đặt hoa định kỳ thành công',
      subscription
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== LẤY DANH SÁCH SUBSCRIPTION CỦA NGƯỜI DÙNG =====
router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = { user: req.user.id };
    if (status) {
      query.status = status;
    }

    const subscriptions = await Subscription.find(query)
      .populate('product')
      .sort({ createdAt: -1 });

    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== LẤY CHI TIẾT MỘT SUBSCRIPTION =====
router.get('/:id', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id).populate('product');
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription không tìm thấy' });
    }

    // Kiểm tra quyền: chỉ chủ nhân hoặc admin mới xem được
    if (subscription.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== CẬP NHẬT SUBSCRIPTION =====
router.patch('/:id', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription không tìm thấy' });
    }

    // Kiểm tra quyền
    if (subscription.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }

    // Cập nhật các trường cho phép
    const allowedUpdates = ['quantity', 'frequency', 'deliveryAddress', 'phone', 'message', 'notes', 'endDate'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        subscription[field] = req.body[field];
      }
    });

    // Nếu thay đổi frequency, tính lại nextDeliveryDate
    if (req.body.frequency) {
      subscription.nextDeliveryDate = calculateNextDeliveryDate(new Date(), req.body.frequency);
    }

    await subscription.save();
    await subscription.populate('product');

    res.json({
      message: 'Cập nhật thành công',
      subscription
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== TẠM DỪNG SUBSCRIPTION =====
router.patch('/:id/pause', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription không tìm thấy' });
    }

    if (subscription.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({ error: 'Chỉ có thể tạm dừng subscription đang hoạt động' });
    }

    subscription.status = 'paused';
    await subscription.save();

    res.json({
      message: 'Tạm dừng đơn đặt hoa định kỳ thành công',
      subscription
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== TIẾ TỤC SUBSCRIPTION =====
router.patch('/:id/resume', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription không tìm thấy' });
    }

    if (subscription.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }

    if (subscription.status !== 'paused') {
      return res.status(400).json({ error: 'Chỉ có thể tiếp tục subscription đang tạm dừng' });
    }

    subscription.status = 'active';
    subscription.nextDeliveryDate = calculateNextDeliveryDate(new Date(), subscription.frequency);
    await subscription.save();

    res.json({
      message: 'Tiếp tục đơn đặt hoa định kỳ thành công',
      subscription
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== HỦY SUBSCRIPTION =====
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription không tìm thấy' });
    }

    if (subscription.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }

    if (subscription.status === 'cancelled') {
      return res.status(400).json({ error: 'Subscription đã được hủy trước đó' });
    }

    subscription.status = 'cancelled';
    subscription.cancellationReason = reason || '';
    await subscription.save();

    res.json({
      message: 'Hủy đơn đặt hoa định kỳ thành công',
      subscription
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== XÓA SUBSCRIPTION (Admin) =====
router.delete('/:id', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription không tìm thấy' });
    }

    // Chỉ admin hoặc chủ nhân mới xóa được
    if (req.user.role !== 'admin' && subscription.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }

    await Subscription.findByIdAndDelete(req.params.id);

    res.json({ message: 'Xóa subscription thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== TẠO ĐƠN HÀNG TỰ ĐỘNG TỪ SUBSCRIPTION (Admin/Cron) =====
router.post('/admin/process-due', auth, async (req, res) => {
  try {
    // Chỉ admin mới có quyền
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }

    // Tìm các subscription cần giao hàng hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueSubscriptions = await Subscription.find({
      status: 'active',
      nextDeliveryDate: { $gte: today, $lt: tomorrow }
    }).populate('product');

    let createdOrders = 0;
    let skippedOrders = 0;
    const errors = [];

    for (const subscription of dueSubscriptions) {
      // Kiểm tra endDate
      if (subscription.endDate && new Date() > subscription.endDate) {
        subscription.status = 'expired';
        await subscription.save();
        continue;
      }

      if (!subscription.product) {
        skippedOrders += 1;
        errors.push({
          subscriptionId: subscription._id,
          reason: 'Sản phẩm trong subscription không còn tồn tại',
        });
        continue;
      }

      const stockItems = [{
        productId: subscription.product._id,
        quantity: subscription.quantity,
      }];
      let isStockReserved = false;

      try {
        await reserveStock(stockItems);
        isStockReserved = true;

        // Tạo order từ subscription
        const order = new Order({
          user: subscription.user,
          items: [{
            product: subscription.product._id,
            productSnapshot: {
              name: subscription.productSnapshot.name,
              nameEn: subscription.productSnapshot.nameEn,
              price: subscription.productSnapshot.price,
              image: subscription.productSnapshot.image,
            },
            quantity: subscription.quantity,
            message: subscription.message,
          }],
          totalPrice: subscription.price,
          status: 'approved',
          deliveryAddress: subscription.deliveryAddress,
          phone: subscription.phone,
        });

        await order.save();

        // Cập nhật subscription
        subscription.lastDeliveryDate = new Date();
        subscription.nextDeliveryDate = calculateNextDeliveryDate(new Date(), subscription.frequency);
        subscription.totalOrdersCreated += 1;
        await subscription.save();

        createdOrders++;
      } catch (err) {
        // reserveStock đã tự rollback nếu trừ kho thất bại giữa chừng.
        // Nếu lỗi xảy ra sau khi trừ kho thành công (vd: save order fail), hoàn kho tại đây.
        if (isStockReserved) {
          await releaseStock(stockItems);
        }
        skippedOrders += 1;
        errors.push({
          subscriptionId: subscription._id,
          reason: err.message,
        });
      }
    }

    res.json({
      message: `Tạo ${createdOrders} đơn hàng từ subscription thành công`,
      createdOrders,
      skippedOrders,
      errors
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== LẤY THỐNG KÊ SUBSCRIPTION (Admin) =====
router.get('/admin/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }

    const stats = await Subscription.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$price' }
        }
      }
    ]);

    const totalSubscriptions = await Subscription.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });

    res.json({
      totalSubscriptions,
      activeSubscriptions,
      stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
