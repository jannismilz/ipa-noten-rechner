const db = require('../config/db');

class Person {
  static async create({ firstName, lastName, thesisTopic, submissionDate }) {
    const result = await db.query(
      'INSERT INTO persons (first_name, last_name, thesis_topic, submission_date) VALUES ($1, $2, $3, $4) RETURNING *',
      [firstName, lastName, thesisTopic, submissionDate]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query('SELECT * FROM persons WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findAll() {
    const result = await db.query('SELECT * FROM persons ORDER BY created_at DESC');
    return result.rows;
  }
}

module.exports = Person;
