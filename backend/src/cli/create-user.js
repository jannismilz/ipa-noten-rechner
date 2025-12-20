import sql from '../db/connection.js';

const args = process.argv.slice(2);

if (args.length !== 2) {
  console.error('Usage: bun run create-user <username> <password>');
  process.exit(1);
}

const [username, password] = args;

if (!username || !password) {
  console.error('Error: Username and password are required');
  process.exit(1);
}

if (password.length < 6) {
  console.error('Error: Password must be at least 6 characters');
  process.exit(1);
}

async function createUser() {
  try {
    const passwordHash = await Bun.password.hash(password);

    const [user] = await sql`
      INSERT INTO users (username, password_hash)
      VALUES (${username}, ${passwordHash})
      RETURNING id, username
    `;

    await sql`
      INSERT INTO user_profiles (user_id, onboarding_completed)
      VALUES (${user.id}, false)
    `;

    console.log('User created successfully:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Username: ${user.username}`);
    
    process.exit(0);
  } catch (error) {
    if (error.code === '23505') {
      console.error('Error: Username already exists');
    } else {
      console.error('Error creating user:', error.message);
    }
    process.exit(1);
  }
}

createUser();
