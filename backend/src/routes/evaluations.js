import express from 'express';
import sql from '../db/connection.js';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

const criteriasData = JSON.parse(
  readFileSync(join(__dirname, '../../../criterias.json'), 'utf-8')
);

router.get('/criteria', (req, res) => {
  res.json(criteriasData);
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const evaluations = await sql`
      SELECT * FROM evaluations WHERE user_id = ${req.userId}
    `;

    const enrichedCriterias = criteriasData.criterias.map(criteria => {
      const evaluation = evaluations.find(e => e.criteria_id === criteria.id);
      return {
        ...criteria,
        evaluation: evaluation || null
      };
    });

    res.json({
      categories: criteriasData.categories_with_weigth,
      criterias: enrichedCriterias
    });
  } catch (error) {
    console.error('Evaluations fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch evaluations' });
  }
});

router.post('/:criteriaId', authMiddleware, async (req, res) => {
  const { criteriaId } = req.params;
  const { fulfilledRequirements, notes, selectedOption } = req.body;

  const criteria = criteriasData.criterias.find(c => c.id === criteriaId);
  if (!criteria) {
    return res.status(404).json({ error: 'Criteria not found' });
  }

  try {
    const [evaluation] = await sql`
      INSERT INTO evaluations (user_id, criteria_id, fulfilled_requirements, notes, selected_option, updated_at)
      VALUES (
        ${req.userId},
        ${criteriaId},
        ${JSON.stringify(fulfilledRequirements || {})},
        ${notes || ''},
        ${selectedOption || null},
        NOW()
      )
      ON CONFLICT (user_id, criteria_id)
      DO UPDATE SET
        fulfilled_requirements = ${JSON.stringify(fulfilledRequirements || {})},
        notes = ${notes || ''},
        selected_option = ${selectedOption || null},
        updated_at = NOW()
      RETURNING *
    `;

    res.json(evaluation);
  } catch (error) {
    console.error('Evaluation save error:', error);
    res.status(500).json({ error: 'Failed to save evaluation' });
  }
});

router.get('/calculate', authMiddleware, async (req, res) => {
  try {
    const evaluations = await sql`
      SELECT * FROM evaluations WHERE user_id = ${req.userId}
    `;

    const categoryScores = {};
    
    criteriasData.categories_with_weigth.forEach(category => {
      const categoryCriterias = criteriasData.criterias.filter(c => c.category === category.id);
      let totalScore = 0;
      let count = 0;

      categoryCriterias.forEach(criteria => {
        const evaluation = evaluations.find(e => e.criteria_id === criteria.id);
        if (evaluation) {
          const grade = calculateGrade(criteria, evaluation);
          if (grade !== null) {
            totalScore += grade;
            count++;
          }
        }
      });

      const averageScore = count > 0 ? totalScore / count : 0;
      categoryScores[category.id] = {
        name: category.name,
        weight: category.weight,
        score: averageScore,
        weightedScore: averageScore * category.weight
      };
    });

    const totalScore = Object.values(categoryScores).reduce((sum, cat) => sum + cat.weightedScore, 0);

    res.json({
      categoryScores,
      totalScore,
      finalGrade: Math.round(totalScore * 10) / 10
    });
  } catch (error) {
    console.error('Calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate scores' });
  }
});

function calculateGrade(criteria, evaluation) {
  if (criteria.selection === 'single' && evaluation.selected_option !== null) {
    const stages = criteria.stages;
    for (const [grade, condition] of Object.entries(stages)) {
      if (condition.must === evaluation.selected_option) {
        return parseInt(grade);
      }
    }
    return null;
  }

  const fulfilled = evaluation.fulfilled_requirements || {};
  const fulfilledCount = Object.values(fulfilled).filter(v => v === true).length;

  const stages = criteria.stages;
  for (const [grade, condition] of Object.entries(stages).sort((a, b) => b[0] - a[0])) {
    if (condition.all && fulfilledCount === criteria.requirements.length) {
      return parseInt(grade);
    }
    if (condition.count !== undefined && fulfilledCount >= condition.count) {
      return parseInt(grade);
    }
    if (condition.counts && condition.counts.includes(fulfilledCount)) {
      return parseInt(grade);
    }
    if (condition.count_less_than !== undefined && fulfilledCount < condition.count_less_than) {
      return parseInt(grade);
    }
    if (condition.must !== undefined) {
      if (fulfilled[condition.must - 1] === true) {
        return parseInt(grade);
      }
    }
  }

  return 0;
}

export default router;
