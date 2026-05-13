const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const auth = require('../middleware/auth');
const {
  applyOrderStatusStockChange,
  VALID_ORDER_STATUSES,
} = require('../utils/stock');

// Middleware: Kiểm tra admin
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Chỉ admin mới có quyền truy cập' });
  }
  next();
};

// ===== DASHBOARD STATISTICS =====
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    // Tổng doanh số (revenue)
    const revenueData = await Order.aggregate([
      { $match: { status: 'delivered' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // Doanh số theo tháng (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, status: 'delivered' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Tổng users
    const totalUsers = await User.countDocuments();

    // Tổng products
    const totalProducts = await Product.countDocuments();

    // Tổng subscriptions (active)
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });

    // Order status breakdown
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Subscription status breakdown
    const subscriptionsByStatus = await Subscription.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top 5 bestselling products
    const topProducts = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.productSnapshot.name' },
          totalQty: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.productSnapshot.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalQty: -1 } },
      { $limit: 5 }
    ]);

    // Inventory status
    const inventoryStatus = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalItems: { $sum: '$stock' },
          lowStockCount: {
            $sum: {
              $cond: [{ $lte: ['$stock', '$minimumStock'] }, 1, 0]
            }
          },
          averageStock: { $avg: '$stock' }
        }
      }
    ]);

    res.json({
      revenue: revenueData[0] || { totalRevenue: 0, totalOrders: 0 },
      monthlyRevenue,
      totalUsers,
      totalProducts,
      activeSubscriptions,
      ordersByStatus,
      subscriptionsByStatus,
      topProducts,
      inventoryStatus: inventoryStatus[0] || { totalItems: 0, lowStockCount: 0, averageStock: 0 }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== ORDERS MANAGEMENT =====
router.get('/orders', auth, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { 'user.email': { $regex: search, $options: 'i' } },
        { 'user.name': { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(query)
    ]);

    res.json({
      orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== GET ORDER DETAIL =====
router.get('/orders/:id', auth, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user');
    
    if (!order) {
      return res.status(404).json({ error: 'Đơn hàng không tìm thấy' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== UPDATE ORDER STATUS =====
router.patch('/orders/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    if (!VALID_ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'ID đơn hàng không hợp lệ' });
    }

    const currentOrder = await Order.findById(req.params.id);
    if (!currentOrder) {
      return res.status(404).json({ error: 'Đơn hàng không tìm thấy' });
    }

    // Kiểm tra nếu đơn hàng đã "delivered" (đã khóa), không cho phép thay đổi
    if (currentOrder.status === 'delivered') {
      return res.status(400).json({ error: 'Không thể thay đổi trạng thái của đơn hàng đã giao' });
    }

    const oldStatus = currentOrder.status;
    await applyOrderStatusStockChange(currentOrder, status);

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, previousStatus: oldStatus },
      { new: true }
    ).populate('user');

    res.json({
      message: 'Cập nhật trạng thái thành công',
      order
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== SUBSCRIPTIONS MANAGEMENT =====
router.get('/subscriptions', auth, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { phone: { $regex: search, $options: 'i' } },
        { deliveryAddress: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [subscriptions, total] = await Promise.all([
      Subscription.find(query)
        .populate('user', 'name email')
        .populate('product', 'name price image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Subscription.countDocuments(query)
    ]);

    res.json({
      subscriptions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== INVENTORY MANAGEMENT =====
router.get('/inventory', auth, adminOnly, async (req, res) => {
  try {
    const { sortBy = 'stock', order = 'asc', search } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nameEn: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    const products = await Product.find(query)
      .sort(sortObj)
      .select('name nameEn price stock minimumStock image');

    // Phân loại: in stock, low stock, out of stock
    const stats = {
      inStock: products.filter(p => p.stock > p.minimumStock).length,
      lowStock: products.filter(p => p.stock > 0 && p.stock <= p.minimumStock).length,
      outOfStock: products.filter(p => p.stock === 0).length
    };

    res.json({
      products,
      stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== UPDATE INVENTORY =====
router.patch('/inventory/:id', auth, adminOnly, async (req, res) => {
  try {
    const { stock, minimumStock } = req.body;

    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ error: 'Số lượng tồn kho không hợp lệ' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        stock,
        ...(minimumStock !== undefined && { minimumStock })
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Sản phẩm không tìm thấy' });
    }

    res.json({
      message: 'Cập nhật tồn kho thành công',
      product
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== QUICK STATS FOR DASHBOARD CARDS =====
router.get('/quick-stats', auth, adminOnly, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Đơn hàng hôm nay
    const ordersToday = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    // Doanh số hôm nay
    const revenueToday = await Order.aggregate([
      { $match: { createdAt: { $gte: today, $lt: tomorrow }, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Đơn hàng chờ xử lý
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    // Hoa tồn kho thấp
    const lowStockProducts = await Product.countDocuments({
      $expr: { $lte: ['$stock', '$minimumStock'] }
    });

    res.json({
      ordersToday,
      revenueToday: revenueToday[0]?.total || 0,
      pendingOrders,
      lowStockProducts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
