// routes/api/collectionRoutes.js
const express = require('express');
const router = express.Router();
const Collection = require('../../models/Collection');
const authenticate = require('../../middlewares/authenticate');
const { default: mongoose } = require('mongoose');

// Get all active collections (public)
router.get('/', async (req, res) => {
  try {
    const collections = await Collection.find({ isActive: true })
      .populate('products')
      .sort({ displayOrder: 1 });

    res.json(collections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single collection by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    
    // Validate ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    const collection = await Collection.findById(id)
      .populate('products');

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    res.json(collection);
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all collections including inactive (admin only)
router.get('/admin/all', authenticate, async (req, res) => {   //admin midleware should be here
  try {
    const collections = await Collection.find()
      .populate('products')
      .sort({ displayOrder: 1 });

    res.json(collections);
  } catch (error) {
    console.error('Error fetching all collections:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update collection status (admin only)
router.patch('/:id/status', authenticate, async (req, res) => { //admin midleware should be here
  try {
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({ message: 'isActive field is required' });
    }

    const collection = await Collection.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    res.json(collection);
  } catch (error) {
    console.error('Error updating collection status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update collection display order (admin only)
router.patch('/:id/order', authenticate, async (req, res) => {//admin midleware should be here
  try {
    const { displayOrder } = req.body;

    if (displayOrder === undefined) {
      return res.status(400).json({ message: 'displayOrder field is required' });
    }

    const collection = await Collection.findByIdAndUpdate(
      req.params.id,
      { displayOrder },
      { new: true }
    );

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    res.json(collection);
  } catch (error) {
    console.error('Error updating collection order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get products by collection ID (public)
router.get('/:id/products', async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id)
      .populate('products');

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    res.json(collection.products);
  } catch (error) {
    console.error('Error fetching collection products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;