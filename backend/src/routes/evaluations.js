import express from 'express';
import sql from '../db/connection.js';
import { authMiddleware } from '../middleware/auth';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { calculateCategoryScores, calculateFinalGrade } from '../../../shared/gradeCalculation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

const criteriasData = JSON.parse(readFileSync(join(__dirname, '../../../criterias.json'), 'utf-8'));

router.get('/criteria', (req, res) => {
  res.json(criteriasData);
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const tickedRequirements = await sql`
      SELECT criteria_id, requirement FROM ticked_requirements WHERE user_id = ${req.userId}
    `;

    const criteriaNotes = await sql`
      SELECT criteria_id, note FROM criteria_notes WHERE user_id = ${req.userId}
    `;

    const enrichedCriterias = criteriasData.criterias.map(criteria => {
      const requirements = tickedRequirements.filter(tr => tr.criteria_id === criteria.id).map(tr => tr.requirement);

      const noteEntry = criteriaNotes.find(cn => cn.criteria_id === criteria.id);

      return {
        ...criteria,
        ticked_requirements: requirements,
        note: noteEntry ? noteEntry.note : null,
      };
    });

    res.json({
      categories: criteriasData.categories_with_weigth,
      criterias: enrichedCriterias,
    });
  } catch (error) {
    console.error('Evaluations fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch evaluations' });
  }
});

router.post('/:criteriaId', authMiddleware, async (req, res) => {
  const { criteriaId } = req.params;
  const { tickedRequirements, note } = req.body;

  const criteria = criteriasData.criterias.find(c => c.id === criteriaId);
  if (!criteria) {
    return res.status(404).json({ error: 'Criteria not found' });
  }

  try {
    await sql.begin(async sql => {
      await sql`
        DELETE FROM ticked_requirements 
        WHERE user_id = ${req.userId} AND criteria_id = ${criteriaId}
      `;

      if (tickedRequirements && tickedRequirements.length > 0) {
        for (const requirement of tickedRequirements) {
          await sql`
            INSERT INTO ticked_requirements (user_id, criteria_id, requirement)
            VALUES (${req.userId}, ${criteriaId}, ${requirement})
            ON CONFLICT (user_id, criteria_id, requirement) DO NOTHING
          `;
        }
      }

      if (note !== undefined) {
        if (note === null || note === '') {
          await sql`
            DELETE FROM criteria_notes 
            WHERE user_id = ${req.userId} AND criteria_id = ${criteriaId}
          `;
        } else {
          await sql`
            INSERT INTO criteria_notes (user_id, criteria_id, note)
            VALUES (${req.userId}, ${criteriaId}, ${note})
            ON CONFLICT (user_id, criteria_id) 
            DO UPDATE SET note = ${note}
          `;
        }
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Evaluation save error:', error);
    res.status(500).json({ error: 'Failed to save evaluation' });
  }
});

router.get('/calculate', authMiddleware, async (req, res) => {
  try {
    const tickedRequirements = await sql`
      SELECT criteria_id, requirement FROM ticked_requirements WHERE user_id = ${req.userId}
    `;

    const evaluations = {};
    tickedRequirements.forEach(tr => {
      if (!evaluations[tr.criteria_id]) {
        evaluations[tr.criteria_id] = { tickedRequirements: [] };
      }
      evaluations[tr.criteria_id].tickedRequirements.push(tr.requirement);
    });

    const categoryScores = calculateCategoryScores(
      criteriasData.categories_with_weigth,
      criteriasData.criterias,
      evaluations
    );

    const finalGrade = calculateFinalGrade(categoryScores);

    res.json({
      categoryScores,
      totalScore: finalGrade,
      finalGrade,
    });
  } catch (error) {
    console.error('Calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate scores' });
  }
});

export default router;
