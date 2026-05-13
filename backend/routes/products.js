const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: 'Product not found' });
  }
  next();
};

// GET /api/products - public
// supports optional filters: ?collection=<id_or_slug>&mood=&season=&featured=true
router.get('/', apiLimiter, async (req, res) => {
  try {
    const { collection: collectionQuery, mood, season, featured, q } = req.query;
    const filter = {};
    if (mood) filter.mood = mood;
    if (season) filter.season = season;
    if (featured !== undefined) filter.featured = featured === 'true';
    if (q) filter.$text = { $search: q };

    // If collection query provided, try to accept either ObjectId or slug
    if (collectionQuery) {
      if (/^[0-9a-fA-F]{24}$/.test(collectionQuery)) {
        filter.collection = collectionQuery;
      } else {
        // find collection by slug and use its id
        const Collection = require('../models/Collection');
        const col = await Collection.findOne({ slug: collectionQuery });
        if (col) filter.collection = col._id;
        else {
          // no collection found by slug -> return empty
          return res.json([]);
        }
      }
    }

    const products = await Product.find(filter).populate('collection').sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/:id - public
router.get('/:id', apiLimiter, validateObjectId, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products - admin only
router.post('/', adminLimiter, protect, adminOnly, async (req, res) => {
  try {
    const payload = req.body;
    // allow collection to be provided as slug or id
    if (payload.collection && typeof payload.collection === 'string' && !/^[0-9a-fA-F]{24}$/.test(payload.collection)) {
      const Collection = require('../models/Collection');
      const col = await Collection.findOne({ slug: payload.collection });
      if (col) payload.collection = col._id;
      else payload.collection = null;
    }
    const product = await Product.create(payload);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/products/:id - admin only
router.put('/:id', adminLimiter, protect, adminOnly, validateObjectId, async (req, res) => {
  try {
    const { name, nameEn, price, description, meaning, durability, size, mood, occasion, season, image, featured } = req.body;
    const update = { name, nameEn, price, description, meaning, durability, size, mood, occasion, season, image, featured };
    if (req.body.collection) {
      let coll = req.body.collection;
      if (typeof coll === 'string' && !/^[0-9a-fA-F]{24}$/.test(coll)) {
        const Collection = require('../models/Collection');
        const colObj = await Collection.findOne({ slug: coll });
        coll = colObj ? colObj._id : null;
      }
      update.collection = coll;
    }
    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/products/:id - admin only
router.delete('/:id', adminLimiter, protect, adminOnly, validateObjectId, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
