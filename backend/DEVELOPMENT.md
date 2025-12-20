# Development Guide

## Quick Start

1. **Install Bun** (if not already installed):
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Setup database**:
   ```bash
   # Create database
   createdb ipa_noten_rechner
   
   # Run migrations
   bun run migrate
   
   # Seed with test data (optional)
   bun run seed
   ```

4. **Start development server**:
   ```bash
   bun run dev
   ```

Server will run on `http://localhost:3001` with hot reload enabled.

## Project Architecture

### KISS Principle
Code follows **Keep It Simple, Stupid** - straightforward implementations without over-engineering.

### DRY Principle  
**Don't Repeat Yourself** - shared logic extracted to utilities and middleware.

### Clean Code
- No unnecessary comments
- Self-documenting code with clear naming
- Simple, focused functions
- Minimal abstractions

## Code Structure

```
src/
├── db/                  # Database layer
│   ├── connection.js    # PostgreSQL connection
│   ├── migrate.js       # Schema migrations
│   └── seed.js          # Test data
├── middleware/          # Express middleware
│   ├── auth.js          # JWT authentication
│   └── errorHandler.js  # Error handling
├── routes/              # API endpoints
│   ├── auth.js          # Login/register
│   ├── users.js         # User profiles
│   └── evaluations.js   # Criteria evaluations
└── index.js             # Application entry
```

## Database Schema

### users
```sql
id SERIAL PRIMARY KEY
email VARCHAR(255) UNIQUE NOT NULL
password_hash VARCHAR(255) NOT NULL
created_at TIMESTAMP DEFAULT NOW()
```

### user_profiles
```sql
id SERIAL PRIMARY KEY
user_id INTEGER REFERENCES users(id)
first_name VARCHAR(100)
last_name VARCHAR(100)
thesis_topic TEXT
submission_date DATE
onboarding_completed BOOLEAN DEFAULT FALSE
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()
```

### evaluations
```sql
id SERIAL PRIMARY KEY
user_id INTEGER REFERENCES users(id)
criteria_id VARCHAR(20) NOT NULL
fulfilled_requirements JSONB DEFAULT '{}'
notes TEXT
selected_option INTEGER
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()
UNIQUE(user_id, criteria_id)
```

## API Testing

### Using cURL

**Register user**:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

**Login**:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

**Get profile** (replace TOKEN):
```bash
curl http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer TOKEN"
```

**Update profile**:
```bash
curl -X PUT http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","thesisTopic":"My Project","onboardingCompleted":true}'
```

**Save evaluation**:
```bash
curl -X POST http://localhost:3001/api/evaluations/A01 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fulfilledRequirements":{"0":true,"1":true,"2":false},"notes":"Test notes"}'
```

### Using HTTPie

More readable alternative to cURL:

```bash
# Install
brew install httpie

# Register
http POST localhost:3001/api/auth/register email=test@example.com password=test123

# Login
http POST localhost:3001/api/auth/login email=test@example.com password=test123

# Get profile
http localhost:3001/api/users/profile Authorization:"Bearer TOKEN"
```

## Database Management

### Connect to database
```bash
psql ipa_noten_rechner
```

### View tables
```sql
\dt
```

### View table structure
```sql
\d users
\d user_profiles
\d evaluations
```

### Reset database
```bash
dropdb ipa_noten_rechner
createdb ipa_noten_rechner
bun run migrate
bun run seed
```

### Manual queries
```sql
-- View all users
SELECT * FROM users;

-- View user with profile
SELECT u.email, up.first_name, up.last_name 
FROM users u 
JOIN user_profiles up ON u.id = up.user_id;

-- View evaluations for user
SELECT * FROM evaluations WHERE user_id = 1;
```

## Common Tasks

### Add new API endpoint

1. Create route handler in `src/routes/`
2. Import and use in `src/index.js`
3. Test endpoint
4. Update API.md documentation

### Modify database schema

1. Update `src/db/migrate.js`
2. Drop and recreate database
3. Run migrations

### Add authentication to endpoint

```javascript
import { authMiddleware } from '../middleware/auth.js';

router.get('/protected', authMiddleware, async (req, res) => {
  // req.userId available here
});
```

## Debugging

### Enable verbose logging

Add to `src/index.js`:
```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

### Database query logging

Use postgres debug mode:
```javascript
const sql = postgres({
  debug: true,
  // ... other options
});
```

### Check Bun version
```bash
bun --version
```

### Clear Bun cache
```bash
rm -rf ~/.bun/install/cache
```

## Performance Tips

1. **Use indexes**: Already configured for common queries
2. **Limit query results**: Add pagination for large datasets
3. **Cache static data**: Consider caching criterias.json
4. **Connection pooling**: Handled automatically by postgres library
5. **Bun advantages**: Faster startup and execution than Node.js

## Code Style

- Use ES modules (`import/export`)
- Async/await for async operations
- Destructure function parameters
- Use const by default, let when needed
- Prefer template literals
- Handle errors explicitly

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "Add feature description"

# Push to remote
git push origin feature/your-feature

# Create pull request on GitHub
```

## Environment Variables

Development (`.env`):
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ipa_noten_rechner
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3001
NODE_ENV=development
JWT_SECRET=dev-secret-key
```

Never commit `.env` to git!

## Troubleshooting

**Port 3001 already in use**:
```bash
lsof -ti:3001 | xargs kill -9
```

**Database connection refused**:
```bash
# Check PostgreSQL is running
brew services start postgresql
# or
sudo systemctl start postgresql
```

**Bun command not found**:
```bash
source ~/.bashrc
# or restart terminal
```

**Module not found**:
```bash
rm -rf node_modules
bun install
```

## Resources

- [Bun Documentation](https://bun.sh/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io/)
