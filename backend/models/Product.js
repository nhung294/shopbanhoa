const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameEn: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  meaning: { type: String, required: true },
  durability: { type: String, required: true },
  size: { type: String, required: true },
  mood: { type: String, enum: ['romantic', 'serene', 'vibrant'], required: true },
  occasion: [{ type: String, enum: ['birthday', 'anniversary', 'sympathy', 'celebration', 'everyday'] }],
  season: [{ type: String, enum: ['spring', 'summer', 'autumn', 'winter'] }],
  image: { type: String, required: true },
  featured: { type: Boolean, default: false },
  // Inventory management
  stock: { 
    type: Number, 
    default: 0,
    min: [0, 'Số lượng tồn kho không thể âm']
  },
  minimumStock: {
    type: Number,
    default: 5,
    min: [0, 'Tồn kho tối thiểu không thể âm']
  },
  // Collection / category reference
  collection: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection', default: null },
}, { timestamps: true, suppressReservedKeysWarning: true });

module.exports = mongoose.model('Product', productSchema);
