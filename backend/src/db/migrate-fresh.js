import sql from './connection.js';

async function migrateFresh() {
  try {
    console.log('Dropping all tables...');
    
    await sql`DROP TABLE IF EXISTS criteria_notes CASCADE`;
    await sql`DROP TABLE IF EXISTS ticked_requirements CASCADE`;
    await sql`DROP TABLE IF EXISTS user_profiles CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;
    
    console.log('All tables dropped successfully');
    console.log('Creating tables...');
    
    await sql`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE user_profiles (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        topic TEXT,
        submission_date DATE
      )
    `;

    await sql`
      CREATE TABLE ticked_requirements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        criteria_id VARCHAR(50) NOT NULL,
        requirement TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, criteria_id, requirement)
      )
    `;

    await sql`
      CREATE TABLE criteria_notes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        criteria_id VARCHAR(50) NOT NULL,
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, criteria_id)
      )
    `;

    console.log('Migration fresh completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration fresh failed:', error);
    process.exit(1);
  }
}

migrateFresh();
