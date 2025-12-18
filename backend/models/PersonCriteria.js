const db = require('../config/db');

class PersonCriteria {
  static async createOrUpdate(personId, criteriaId, { fulfilledRequirements, notes, qualityLevel }) {
    const result = await db.query(
      `INSERT INTO person_criteria 
       (person_id, criteria_id, fulfilled_requirements, notes, quality_level) 
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (person_id, criteria_id) 
       DO UPDATE SET 
         fulfilled_requirements = EXCLUDED.fulfilled_requirements,
         notes = EXCLUDED.notes,
         quality_level = EXCLUDED.quality_level,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [personId, criteriaId, JSON.stringify(fulfilledRequirements), notes, qualityLevel]
    );
    return result.rows[0];
  }

  static async findByPersonAndCriteria(personId, criteriaId) {
    const result = await db.query(
      'SELECT * FROM person_criteria WHERE person_id = $1 AND criteria_id = $2',
      [personId, criteriaId]
    );
    return result.rows[0];
  }

  static async findByPerson(personId) {
    const result = await db.query(
      `SELECT pc.*, c.title, c.guiding_question, c.requirements, c.quality_levels, c.category 
       FROM person_criteria pc
       JOIN criteria c ON pc.criteria_id = c.criteria_id
       WHERE pc.person_id = $1
       ORDER BY c.criteria_id`,
      [personId]
    );
    return result.rows;
  }

  static async calculateScores(personId) {
    // Calculate quality level scores for each category
    const result = await db.query(
      `WITH category_scores AS (
        SELECT 
          c.category,
          AVG(pc.quality_level) as avg_score,
          COUNT(*) as criteria_count
        FROM person_criteria pc
        JOIN criteria c ON pc.criteria_id = c.criteria_id
        WHERE pc.person_id = $1
        GROUP BY c.category
      )
      SELECT 
        jsonb_object_agg(
          category, 
          jsonb_build_object(
            'averageScore', ROUND(avg_score::numeric, 2),
            'criteriaCount', criteria_count
          )
        ) as scores
      FROM category_scores`,
      [personId]
    );

    const scores = result.rows[0]?.scores || {};
    
    // Calculate overall grade based on BBW grading system
    // This is a simplified calculation - adjust weights as needed
    const part1Weight = 0.6; // Weight for part 1 (A, B, C, G, H)
    const part2Weight = 0.4; // Weight for part 2 (Documentation)
    
    let part1Score = 0;
    let part1Count = 0;
    let part2Score = 0;
    let part2Count = 0;

    Object.entries(scores).forEach(([category, data]) => {
      if (category === 'D') {
        part2Score += data.averageScore;
        part2Count++;
      } else {
        part1Score += data.averageScore;
        part1Count++;
      }
    });

    // Calculate weighted average for each part
    const part1Average = part1Count > 0 ? part1Score / part1Count : 0;
    const part2Average = part2Count > 0 ? part2Score / part2Count : 0;

    // Calculate final grade (1-6 scale, where 6 is best)
    const finalGrade = (part1Average * part1Weight + part2Average * part2Weight) * 5 / 3 + 1;

    return {
      part1: {
        score: part1Average,
        grade: Math.min(6, Math.max(1, part1Average * 5 / 3 + 1)).toFixed(2)
      },
      part2: {
        score: part2Average,
        grade: Math.min(6, Math.max(1, part2Average * 5 / 3 + 1)).toFixed(2)
      },
      finalGrade: Math.min(6, Math.max(1, finalGrade)).toFixed(2)
    };
  }
}

module.exports = PersonCriteria;
