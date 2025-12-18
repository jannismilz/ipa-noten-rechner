const db = require('../config/db');

class Criteria {
  static async create({ criteriaId, title, guidingQuestion, requirements, qualityLevels, category }) {
    const result = await db.query(
      'INSERT INTO criteria (criteria_id, title, guiding_question, requirements, quality_levels, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [criteriaId, title, guidingQuestion, JSON.stringify(requirements), JSON.stringify(qualityLevels), category]
    );
    return result.rows[0];
  }

  static async findById(criteriaId) {
    const result = await db.query('SELECT * FROM criteria WHERE criteria_id = $1', [criteriaId]);
    return result.rows[0];
  }

  static async findAll() {
    const result = await db.query('SELECT * FROM criteria ORDER BY criteria_id');
    return result.rows;
  }

  static async findByCategory(category) {
    const result = await db.query('SELECT * FROM criteria WHERE category = $1 ORDER BY criteria_id', [category]);
    return result.rows;
  }

  static async update(criteriaId, { title, guidingQuestion, requirements, qualityLevels, category }) {
    const result = await db.query(
      'UPDATE criteria SET title = $1, guiding_question = $2, requirements = $3, quality_levels = $4, category = $5 WHERE criteria_id = $6 RETURNING *',
      [title, guidingQuestion, JSON.stringify(requirements), JSON.stringify(qualityLevels), category, criteriaId]
    );
    return result.rows[0];
  }

  static async delete(criteriaId) {
    const result = await db.query('DELETE FROM criteria WHERE criteria_id = $1 RETURNING *', [criteriaId]);
    return result.rows[0];
  }
}

module.exports = Criteria;
