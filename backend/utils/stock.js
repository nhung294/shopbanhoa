const mongoose = require('mongoose');
const Product = require('../models/Product');

const VALID_ORDER_STATUSES = ['pending', 'approved', 'rejected', 'delivered'];

const normalizeStockItems = (items = []) => {
  const aggregated = new Map();

  for (const item of items) {
    const productId = String(item.productId || item.product || '');
    const quantity = Number(item.quantity);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error(`Mã sản phẩm không hợp lệ: "${productId}"`);
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error(`Số lượng sản phẩm không hợp lệ cho ID ${productId}`);
    }

    aggregated.set(productId, (aggregated.get(productId) || 0) + quantity);
  }

  return Array.from(aggregated, ([productId, quantity]) => ({ productId, quantity }));
};

const rollbackReservedStock = async (reservedItems) => {
  if (!reservedItems.length) return;

  await Promise.all(reservedItems.map(({ productId, quantity }) =>
    Product.updateOne({ _id: productId }, { $inc: { stock: quantity } })
  ));
};

const reserveStock = async (items) => {
  const normalizedItems = normalizeStockItems(items);
  const reservedItems = [];

  try {
    for (const { productId, quantity } of normalizedItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true }
      );

      if (!updatedProduct) {
        const product = await Product.findById(productId).select('name stock');
        if (!product) {
          throw new Error(`Sản phẩm ID ${productId} không tồn tại`);
        }
        throw new Error(
          `Sản phẩm "${product.name}" chỉ còn ${product.stock} cái. Bạn đặt ${quantity} cái.`
        );
      }

      reservedItems.push({ productId, quantity });
    }
  } catch (error) {
    await rollbackReservedStock(reservedItems);
    throw error;
  }

  return normalizedItems;
};

const releaseStock = async (items) => {
  const normalizedItems = normalizeStockItems(items);

  if (!normalizedItems.length) return;

  await Promise.all(normalizedItems.map(({ productId, quantity }) =>
    Product.updateOne({ _id: productId }, { $inc: { stock: quantity } })
  ));
};

const applyOrderStatusStockChange = async (order, newStatus) => {
  if (!VALID_ORDER_STATUSES.includes(newStatus)) {
    throw new Error('Trạng thái đơn hàng không hợp lệ');
  }

  const oldStatus = order.status;
  if (oldStatus === newStatus) return;

  const items = order.items.map((item) => ({
    productId: item.product,
    quantity: item.quantity,
  }));

  // Khi chuyển sang "delivered" - trừ kho hàng
  if (newStatus === 'delivered' && oldStatus !== 'delivered') {
    // Chỉ trừ kho nếu chưa trừ trước đó (từ pending, approved, rejected)
    if (oldStatus === 'pending' || oldStatus === 'approved' || oldStatus === 'rejected') {
      await reserveStock(items);
    }
    return;
  }

  // Khi chuyển sang "rejected" - hoàn lại kho (nếu đã trừ)
  if (newStatus === 'rejected') {
    // Nếu từ delivered mà chuyển về rejected, hoàn lại kho
    if (oldStatus === 'delivered') {
      await releaseStock(items);
    }
    // Từ pending hoặc approved sang rejected thì không cần làm gì (chưa trừ kho)
    return;
  }

  // approved -> rejected: không cần hoàn kho (chưa trừ)
  // rejected -> approved: không cần trừ (chờ delivered)
};

module.exports = {
  reserveStock,
  releaseStock,
  applyOrderStatusStockChange,
  VALID_ORDER_STATUSES,
};
