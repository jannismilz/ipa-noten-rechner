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
    const tickedRequirements = await sql`
      SELECT criteria_id, requirement FROM ticked_requirements WHERE user_id = ${req.userId}
    `;

    const criteriaNotes = await sql`
      SELECT criteria_id, note FROM criteria_notes WHERE user_id = ${req.userId}
    `;

    const enrichedCriterias = criteriasData.criterias.map(criteria => {
      const requirements = tickedRequirements
        .filter(tr => tr.criteria_id === criteria.id)
        .map(tr => tr.requirement);
      
      const noteEntry = criteriaNotes.find(cn => cn.criteria_id === criteria.id);
      
      return {
        ...criteria,
        ticked_requirements: requirements,
        note: noteEntry ? noteEntry.note : null
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

    const criteriaNotes = await sql`
      SELECT criteria_id, note FROM criteria_notes WHERE user_id = ${req.userId}
    `;

    const categoryScores = {};
    
    criteriasData.categories_with_weigth.forEach(category => {
      const categoryCriterias = criteriasData.criterias.filter(c => c.category === category.id);
      let totalScore = 0;
      let count = 0;

      categoryCriterias.forEach(criteria => {
        const requirements = tickedRequirements
          .filter(tr => tr.criteria_id === criteria.id)
          .map(tr => tr.requirement);
        
        const grade = calculateGrade(criteria, requirements);
        if (grade !== null) {
          totalScore += grade;
          count++;
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

function calculateGrade(criteria, tickedRequirements) {
  if (criteria.selection === 'single') {
    if (tickedRequirements.length === 0) {
      return null;
    }
    const selectedRequirement = tickedRequirements[0];
    const selectedIndex = criteria.requirements.indexOf(selectedRequirement);
    if (selectedIndex === -1) {
      return null;
    }

    const stages = criteria.stages;
    for (const grade of ['3', '2', '1', '0']) {
      const condition = stages[grade];
      if (!condition) continue;
      
      if (condition.must !== undefined && condition.must === selectedIndex + 1) {
        return parseInt(grade);
      }
    }
    return null;
  }

  const tickedCount = tickedRequirements.length;
  const totalRequirements = criteria.requirements.length;

  const stages = criteria.stages;
  for (const grade of ['3', '2', '1', '0']) {
    const condition = stages[grade];
    if (!condition) continue;

    if (condition.all && tickedCount === totalRequirements) {
      return parseInt(grade);
    }
    
    if (condition.count !== undefined && tickedCount >= condition.count) {
      return parseInt(grade);
    }
    
    if (condition.counts && condition.counts.includes(tickedCount)) {
      return parseInt(grade);
    }
    
    if (condition.count_less_than !== undefined && tickedCount < condition.count_less_than) {
      return parseInt(grade);
    }
    
    if (condition.must !== undefined) {
      const mustRequirement = criteria.requirements[condition.must - 1];
      if (tickedRequirements.includes(mustRequirement)) {
        if (condition.count !== undefined && tickedCount >= condition.count) {
          return parseInt(grade);
        } else if (condition.count === undefined) {
          return parseInt(grade);
        }
      }
    }
  }

  return 0;
}

export default router;
