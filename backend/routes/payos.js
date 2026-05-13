const express = require('express');
const router = express.Router();
const payos = require('../config/payos');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// POST /api/payos/payment-link - Tạo link thanh toán
router.post('/payment-link', protect, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const order = await Order.findById(orderId).populate('user', 'email phone name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (order.paymentStatus === 'completed') {
      return res.status(400).json({ message: 'Order already paid' });
    }

    const orderCode = Date.now() % 1000000; // 6-digit decimal, không phải hex
    const rawDesc = `Thanh toan don hang ${orderCode}`;

    const paymentData = {
      orderCode,
      amount: Math.round(order.totalPrice),
      description: rawDesc.slice(0, 25),
      buyerName: order.user.name || 'Customer',
      buyerEmail: order.user.email,
      buyerPhone: order.phone,
      buyerAddress: order.deliveryAddress,
      items: order.items.map(item => ({
        name: item.productSnapshot.name,
        quantity: item.quantity,
        price: Math.round(item.productSnapshot.price),
      })),
      returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout?status=success&orderId=${order._id}`,
      cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout?status=cancel&orderId=${order._id}`,
    };

    const paymentLink = await payos.paymentRequests.create(paymentData);

    order.paymentMethod = 'payos';
    order.paymentStatus = 'pending';
    order.payosTransaction = {
      transactionId: paymentLink.paymentLinkId,
      referenceId: paymentLink.paymentLinkId,
      amount: paymentData.amount,
      currency: 'VND',
      paymentLinkId: paymentLink.paymentLinkId,
      checkoutUrl: paymentLink.checkoutUrl,
      createdAt: new Date(),
    };

    await order.save();

    res.json({
      checkoutUrl: paymentLink.checkoutUrl,
      paymentLinkId: paymentLink.paymentLinkId,
      orderCode: paymentData.orderCode,
    });
  } catch (err) {
    console.error('[PayOS Error]:', err.message);
    res.status(500).json({ message: err.message || 'Failed to create payment link' });
  }
});

// GET /api/payos/payment-status/:orderId - Kiểm tra trạng thái thanh toán từ DB
router.get('/payment-status/:orderId', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json({
      orderId: order._id,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      transactionId: order.payosTransaction?.transactionId,
      completedAt: order.payosTransaction?.completedAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/payos/check-payment/:orderId - Pull trạng thái từ PayOS API
router.get('/check-payment/:orderId', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (!order.payosTransaction?.paymentLinkId) {
      return res.status(400).json({ message: 'No payment link found for this order' });
    }

    const paymentInfo = await payos.paymentRequests.get(order.payosTransaction.paymentLinkId);
    const status = paymentInfo.status;

    if (status === 'PAID' && order.paymentStatus !== 'completed') {
      order.paymentStatus = 'completed';
      if (order.payosTransaction) {
        order.payosTransaction.completedAt = new Date();
      }
      await order.save();
    } else if (
      (status === 'CANCELLED' || status === 'EXPIRED') &&
      order.paymentStatus !== 'failed'
    ) {
      order.paymentStatus = 'failed';
      await order.save();
    }

    res.json({
      orderId: order._id,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      transactionId: order.payosTransaction?.transactionId,
      payosStatus: status,
      completedAt: order.payosTransaction?.completedAt,
    });
  } catch (err) {
    console.error('[PayOS Check Error]:', err.message);
    res.status(500).json({ message: err.message || 'Failed to check payment status' });
  }
});

// POST /api/payos/webhook - Nhận webhook từ PayOS
router.post('/webhook', express.json(), async (req, res) => {
  try {
    let webhookData;
    try {
      webhookData = payos.webhooks.verify(req.body);
    } catch (verifyErr) {
      console.error('[PayOS Webhook] Verification failed:', verifyErr.message);
      return res.status(400).json({ success: false, message: 'Webhook verification failed' });
    }

    const { data } = webhookData;

    // code === '00' nghĩa là thanh toán thành công
    if (webhookData.success === true && data.code === '00') {
      const order = await Order.findOne({
        'payosTransaction.transactionId': data.paymentLinkId,
      });

      if (order) {
        order.paymentStatus = 'completed';
        if (order.payosTransaction) {
          order.payosTransaction.completedAt = new Date();
        }
        await order.save();
      } else {
        console.warn('[PayOS Webhook] Order not found for paymentLinkId:', data.paymentLinkId);
      }
    } else if (webhookData.success === false) {
      const order = await Order.findOne({
        'payosTransaction.transactionId': data.paymentLinkId,
      });

      if (order) {
        order.paymentStatus = 'failed';
        await order.save();
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[PayOS Webhook Error]:', err.message, err.stack);
    res.status(200).json({ success: false, error: err.message });
  }
});

// POST /api/payos/webhook-debug - Debug webhook (chỉ for development)
router.post('/webhook-debug', express.json(), async (req, res) => {
  try {
    console.log('[PayOS Webhook Debug] Raw body:', JSON.stringify(req.body, null, 2));

    const webhookData = payos.webhooks.verify(req.body);
    console.log('[PayOS Webhook Debug] Verified data:', JSON.stringify(webhookData, null, 2));

    res.json({
      success: true,
      received: req.body,
      verified: webhookData,
    });
  } catch (err) {
    console.error('[PayOS Webhook Debug] Error:', err.message);
    res.status(400).json({
      success: false,
      error: err.message,
      received: req.body,
    });
  }
});

module.exports = router;
