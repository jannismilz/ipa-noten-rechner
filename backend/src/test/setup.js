import sql from '../db/connection.js';

export async function setupTestDatabase() {
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
      submission_date DATE,
      specialty VARCHAR(50),
      project_method VARCHAR(20)
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
  `;
}

export async function cleanupTestDatabase() {
  await sql`DROP TABLE IF EXISTS criteria_notes CASCADE`;
  await sql`DROP TABLE IF EXISTS ticked_requirements CASCADE`;
  await sql`DROP TABLE IF EXISTS user_profiles CASCADE`;
  await sql`DROP TABLE IF EXISTS users CASCADE`;
}

export async function createTestUser(username = 'testuser', password = 'testpass123') {
  await sql`DELETE FROM users WHERE username = ${username}`;

  const passwordHash = await Bun.password.hash(password);

  const [user] = await sql`
    INSERT INTO users (username, password_hash)
    VALUES (${username}, ${passwordHash})
    RETURNING id, username
  `;

  await sql`
    INSERT INTO user_profiles (user_id, first_name, last_name)
    VALUES (${user.id}, 'Test', 'User')
  `;

  return user;
}

export async function deleteTestUser(userId) {
  await sql`DELETE FROM users WHERE id = ${userId}`;
}
