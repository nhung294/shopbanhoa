const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Collection = require('../models/Collection');
const { protect, adminOnly } = require('../middleware/auth');

const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: 'Collection not found' });
  }
  next();
};

// GET all collections
router.get('/', async (req, res) => {
  try {
    const cols = await Collection.find().sort({ createdAt: -1 });
    res.json(cols);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single collection
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const col = await Collection.findById(req.params.id);
    if (!col) return res.status(404).json({ message: 'Collection not found' });
    res.json(col);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, slug, description, image } = req.body;
    const existing = await Collection.findOne({ $or: [{ name }, { slug }] });
    if (existing) return res.status(400).json({ message: 'Collection name or slug already exists' });
    const col = await Collection.create({ name, slug, description, image });
    res.status(201).json(col);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update (admin)
router.put('/:id', protect, adminOnly, validateObjectId, async (req, res) => {
  try {
    const update = (({ name, slug, description, image }) => ({ name, slug, description, image }))(req.body);
    const col = await Collection.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!col) return res.status(404).json({ message: 'Collection not found' });
    res.json(col);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE (admin)
router.delete('/:id', protect, adminOnly, validateObjectId, async (req, res) => {
  try {
    const col = await Collection.findByIdAndDelete(req.params.id);
    if (!col) return res.status(404).json({ message: 'Collection not found' });
    res.json({ message: 'Collection deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
