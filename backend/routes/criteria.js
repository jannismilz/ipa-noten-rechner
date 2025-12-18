const express = require('express');
const router = express.Router();
const Criteria = require('../models/Criteria');

// Get all criteria
router.get('/', async (req, res) => {
  try {
    const criteria = await Criteria.findAll();
    res.json(criteria);
  } catch (error) {
    console.error('Error fetching criteria:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get criteria by category
router.get('/category/:category', async (req, res) => {
  try {
    const criteria = await Criteria.findByCategory(req.params.category);
    if (!criteria || criteria.length === 0) {
      return res.status(404).json({ error: 'No criteria found for this category' });
    }
    res.json(criteria);
  } catch (error) {
    console.error('Error fetching criteria by category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new criteria
router.post('/', async (req, res) => {
  try {
    const { criteriaId, title, guidingQuestion, requirements, qualityLevels, category } = req.body;
    
    // Validate required fields
    if (!criteriaId || !title || !guidingQuestion || !requirements || !qualityLevels || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate requirements and qualityLevels are objects or arrays
    if (typeof requirements !== 'object' || typeof qualityLevels !== 'object') {
      return res.status(400).json({ error: 'Requirements and qualityLevels must be objects' });
    }

    const criteria = await Criteria.create({
      criteriaId,
      title,
      guidingQuestion,
      requirements,
      qualityLevels,
      category
    });

    res.status(201).json(criteria);
  } catch (error) {
    console.error('Error creating criteria:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Criteria with this ID already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a criteria
router.put('/:id', async (req, res) => {
  try {
    const { title, guidingQuestion, requirements, qualityLevels, category } = req.body;
    
    // Validate at least one field is being updated
    if (!title && !guidingQuestion && !requirements && !qualityLevels && !category) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const criteria = await Criteria.update(req.params.id, {
      title,
      guidingQuestion,
      requirements,
      qualityLevels,
      category
    });

    if (!criteria) {
      return res.status(404).json({ error: 'Criteria not found' });
    }

    res.json(criteria);
  } catch (error) {
    console.error('Error updating criteria:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a criteria
router.delete('/:id', async (req, res) => {
  try {
    const criteria = await Criteria.delete(req.params.id);
    if (!criteria) {
      return res.status(404).json({ error: 'Criteria not found' });
    }
    res.json({ message: 'Criteria deleted successfully' });
  } catch (error) {
    console.error('Error deleting criteria:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
