import sql from './connection.js';

async function reset() {
  try {
    console.log('Dropping all tables...');
    
    await sql`DROP TABLE IF EXISTS criteria_notes CASCADE`;
    await sql`DROP TABLE IF EXISTS ticked_requirements CASCADE`;
    await sql`DROP TABLE IF EXISTS user_profiles CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;
    
    console.log('All tables dropped successfully');
    process.exit(0);
  } catch (error) {
    console.error('Reset failed:', error);
    process.exit(1);
  }
}

reset();
