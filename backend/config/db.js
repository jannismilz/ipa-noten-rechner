const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test the database connection
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Successfully connected to the database');
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};

// Initialize database tables
const initializeDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS persons (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        thesis_topic TEXT NOT NULL,
        submission_date DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS criteria (
        id SERIAL PRIMARY KEY,
        criteria_id VARCHAR(20) UNIQUE NOT NULL,
        title TEXT NOT NULL,
        guiding_question TEXT NOT NULL,
        requirements JSONB NOT NULL,
        quality_levels JSONB NOT NULL,
        category VARCHAR(10) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS person_criteria (
        id SERIAL PRIMARY KEY,
        person_id INTEGER REFERENCES persons(id) ON DELETE CASCADE,
        criteria_id VARCHAR(20) REFERENCES criteria(criteria_id) ON DELETE CASCADE,
        fulfilled_requirements JSONB,
        notes TEXT,
        quality_level INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(person_id, criteria_id)
      );
    `);
    console.log('Database tables initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

initializeDb();
