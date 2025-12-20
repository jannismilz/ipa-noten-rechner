import sql from './connection.js';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const [user] = await sql`
      INSERT INTO users (email, password_hash)
      VALUES ('admin@example.com', ${hashedPassword})
      ON CONFLICT (email) DO UPDATE SET password_hash = ${hashedPassword}
      RETURNING id
    `;

    await sql`
      INSERT INTO user_profiles (user_id, first_name, last_name, onboarding_completed)
      VALUES (${user.id}, 'Admin', 'User', true)
      ON CONFLICT DO NOTHING
    `;

    console.log('✓ Seed completed successfully');
    console.log('  Email: admin@example.com');
    console.log('  Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('✗ Seed failed:', error);
    process.exit(1);
  }
}

seed();
