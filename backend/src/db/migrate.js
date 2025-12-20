import sql from './connection.js';

async function migrate() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        topic TEXT,
        submission_date DATE
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS ticked_requirements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        criteria_id VARCHAR(10) NOT NULL,
        requirement TEXT NOT NULL,
        UNIQUE(user_id, criteria_id, requirement)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS criteria_notes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        criteria_id VARCHAR(10) NOT NULL,
        note TEXT,
        UNIQUE(user_id, criteria_id)
      )
    `

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
