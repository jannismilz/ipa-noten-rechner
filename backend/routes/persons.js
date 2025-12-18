const express = require('express');
const router = express.Router();
const Person = require('../models/Person');
const Criteria = require('../models/Criteria');
const PersonCriteria = require('../models/PersonCriteria');

// Create a new person
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, thesisTopic, submissionDate } = req.body;
    
    if (!firstName || !lastName || !thesisTopic || !submissionDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const person = await Person.create({
      firstName,
      lastName,
      thesisTopic,
      submissionDate
    });

    res.status(201).json(person);
  } catch (error) {
    console.error('Error creating person:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all persons
router.get('/', async (req, res) => {
  try {
    const persons = await Person.findAll();
    res.json(persons);
  } catch (error) {
    console.error('Error fetching persons:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific person with their criteria progress
router.get('/:id', async (req, res) => {
  try {
    const person = await Person.findById(req.params.id);
    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }

    const criteria = await Criteria.findAll();
    const personCriteria = await PersonCriteria.findByPerson(req.params.id);
    const scores = await PersonCriteria.calculateScores(req.params.id);

    // Merge criteria with person's progress
    const criteriaWithProgress = criteria.map(criterion => {
      const progress = personCriteria.find(pc => pc.criteria_id === criterion.criteria_id) || {};
      return {
        ...criterion,
        fulfilled_requirements: progress.fulfilled_requirements || {},
        notes: progress.notes || '',
        quality_level: progress.quality_level || 0
      };
    });

    res.json({
      ...person,
      criteria: criteriaWithProgress,
      scores
    });
  } catch (error) {
    console.error('Error fetching person details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update person criteria progress
router.put('/:id/criteria/:criteriaId', async (req, res) => {
  try {
    const { fulfilledRequirements, notes, qualityLevel } = req.body;
    
    // Validate input
    if (fulfilledRequirements && typeof fulfilledRequirements !== 'object') {
      return res.status(400).json({ error: 'fulfilledRequirements must be an object' });
    }
    
    if (qualityLevel !== undefined && (qualityLevel < 0 || qualityLevel > 3)) {
      return res.status(400).json({ error: 'qualityLevel must be between 0 and 3' });
    }

    // Check if person exists
    const person = await Person.findById(req.params.id);
    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }

    // Check if criteria exists
    const criteria = await Criteria.findById(req.params.criteriaId);
    if (!criteria) {
      return res.status(404).json({ error: 'Criteria not found' });
    }

    // Update or create person criteria
    const result = await PersonCriteria.createOrUpdate(
      req.params.id,
      req.params.criteriaId,
      {
        fulfilledRequirements: fulfilledRequirements || {},
        notes: notes || '',
        qualityLevel: qualityLevel !== undefined ? qualityLevel : 0
      }
    );

    // Calculate updated scores
    const scores = await PersonCriteria.calculateScores(req.params.id);

    res.json({
      ...result,
      scores
    });
  } catch (error) {
    console.error('Error updating person criteria:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
