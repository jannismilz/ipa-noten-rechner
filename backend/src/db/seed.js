import sql from './connection.js';

async function seed() {
  try {
    const hashedPassword = await Bun.password.hash('test');

    const [user] = await sql`
      INSERT INTO users (username, password_hash)
      VALUES ('test', ${hashedPassword})
      ON CONFLICT (username) DO UPDATE SET password_hash = ${hashedPassword}
      RETURNING id
    `;

    await sql`
      INSERT INTO user_profiles (user_id, first_name, last_name, topic, submission_date)
      VALUES (${user.id}, 'Test', 'User', 'Test Topic', '2026-04-15')
      ON CONFLICT DO NOTHING
    `;

    console.log('Seed completed successfully');
    console.log('  username: test');
    console.log('  password: test');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
