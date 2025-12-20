# Backend Architecture

## Technology Stack

- **Runtime**: Bun 1.x (faster than Node.js)
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL 14+
- **Authentication**: JWT with bcryptjs
- **ORM**: postgres (SQL template strings)

## Design Principles

### KISS (Keep It Simple, Stupid)
- Straightforward implementations
- No unnecessary abstractions
- Direct database queries without heavy ORM
- Simple middleware chain

### DRY (Don't Repeat Yourself)
- Shared authentication middleware
- Centralized error handling
- Reusable database connection
- Single criteria data source

### Clean Code
- Self-documenting variable and function names
- No obvious comments (code explains itself)
- Small, focused functions
- Consistent code style with ES modules

## Project Structure

```
backend/
├── src/
│   ├── db/
│   │   ├── connection.js         # PostgreSQL connection setup
│   │   ├── migrate.js            # Database schema creation
│   │   └── seed.js               # Sample data insertion
│   ├── middleware/
│   │   ├── auth.js               # JWT auth & optional auth
│   │   └── errorHandler.js      # Centralized error handling
│   ├── routes/
│   │   ├── auth.js               # Login & registration
│   │   ├── users.js              # Profile management
│   │   └── evaluations.js       # Criteria & scoring
│   └── index.js                  # Application entry point
├── .env                          # Environment variables
├── .env.example                  # Template for env vars
├── .gitignore                    # Git ignore rules
├── .dockerignore                 # Docker ignore rules
├── package.json                  # Dependencies & scripts
├── Dockerfile                    # Docker image definition
├── docker-compose.yml            # Multi-container setup
├── README.md                     # Setup instructions
├── API.md                        # API documentation
├── DEVELOPMENT.md                # Development guide
├── DEPLOYMENT.md                 # Deployment guide
└── ARCHITECTURE.md               # This file
```

## Data Flow

### Authentication Flow
```
Client → POST /api/auth/register
       → bcrypt.hash(password)
       → INSERT INTO users
       → jwt.sign({ userId })
       → Return { token, userId }

Client → POST /api/auth/login
       → SELECT user WHERE email
       → bcrypt.compare(password, hash)
       → jwt.sign({ userId })
       → Return { token, userId }
```

### Authenticated Request Flow
```
Client → GET /api/users/profile
       → authMiddleware extracts token
       → jwt.verify(token)
       → req.userId = decoded.userId
       → Route handler uses req.userId
       → Return user data
```

### Evaluation Save Flow
```
Client → POST /api/evaluations/:criteriaId
       → authMiddleware
       → Validate criteria exists
       → UPSERT evaluation data
       → Return saved evaluation
```

### Score Calculation Flow
```
Client → GET /api/evaluations/calculate
       → Fetch all user evaluations
       → Load criteria definitions
       → For each category:
         - Find matching criterias
         - Calculate grade per criteria
         - Average category score
         - Apply category weight
       → Sum weighted scores
       → Return final grade
```

## Database Schema

### Relationships
```
users (1) ──< user_profiles (1)
users (1) ──< evaluations (*)

evaluations.criteria_id → criterias.json
```

### Tables

**users**
- Primary authentication table
- Stores email and password hash
- One-to-one with user_profiles

**user_profiles**
- Extended user information
- Onboarding status tracking
- Thesis metadata

**evaluations**
- Many-to-many link (users × criteria)
- JSONB for flexible requirement storage
- Supports both checkbox and single-select modes

### Indexes
```sql
CREATE INDEX idx_evaluations_user_id ON evaluations(user_id);
CREATE INDEX idx_evaluations_criteria_id ON evaluations(criteria_id);
```

## API Architecture

### RESTful Design
- Resource-based URLs
- HTTP methods for CRUD
- Consistent JSON responses
- Standard HTTP status codes

### Endpoint Patterns
```
/api/auth/*          Public endpoints
/api/users/*         Protected endpoints
/api/evaluations/*   Protected + public mixed
/health              Public health check
```

### Error Handling
```javascript
try {
  // Database operation
} catch (error) {
  console.error('Context:', error);
  res.status(500).json({ error: 'Generic message' });
}
```

Centralized error handler catches unhandled errors.

## Security Measures

### Authentication
- JWT tokens with 7-day expiration
- Secure password hashing (bcrypt, 10 rounds)
- Authorization header validation
- Token verification on protected routes

### Database
- Parameterized queries (SQL injection protection)
- Foreign key constraints
- Unique constraints on email
- Password never returned in responses

### Environment
- Secrets in environment variables
- No hardcoded credentials
- JWT secret configurable
- Different configs per environment

## Grade Calculation Logic

### Stage Evaluation
For each criteria, check fulfilled requirements against stages:

```javascript
stages: {
  "3": { "all": true },           // All requirements met
  "2": { "count": 3 },            // At least 3 met
  "1": { "count": 2 },            // At least 2 met
  "0": { "count_less_than": 2 }   // Less than 2 met
}
```

### Stage Types
- `all`: All requirements fulfilled
- `count`: Minimum count of fulfilled
- `counts`: Array of exact counts
- `count_less_than`: Below threshold
- `must`: Specific requirement required

### Single Selection
For criteria with `selection: "single"`:
```javascript
stages: {
  "3": { "must": 1 },  // Option 1 selected
  "2": { "must": 2 },  // Option 2 selected
  "1": { "must": 3 },  // Option 3 selected
  "0": { "must": 4 }   // Option 4 selected
}
```

### Final Grade
```
categoryScore = average(criteria grades in category)
weightedScore = categoryScore × category.weight
finalGrade = sum(all weightedScores)
```

Example:
- HKB: 2.75 × 0.5 = 1.375
- DOK: 3.0 × 0.2 = 0.6
- FPD: 2.5 × 0.3 = 0.75
- **Total: 2.725 → 2.7**

## Performance Considerations

### Bun Advantages
- 3x faster startup than Node.js
- 50% less memory usage
- Native TypeScript support
- Built-in test runner

### Database Optimization
- Indexes on foreign keys
- JSONB for flexible storage
- Connection pooling automatic
- Efficient queries with postgres library

### Response Times (typical)
- Authentication: <50ms
- Profile fetch: <30ms
- Evaluations list: <100ms
- Score calculation: <150ms

## Extension Points

### Adding New Endpoints
1. Create route file in `src/routes/`
2. Import in `src/index.js`
3. Use middleware as needed
4. Follow existing patterns

### Adding New Tables
1. Update `src/db/migrate.js`
2. Add SQL CREATE TABLE
3. Run migration
4. Create route handlers

### Adding Middleware
1. Create in `src/middleware/`
2. Export function
3. Apply in routes or globally

## Testing Strategy

### Manual Testing
- cURL commands in DEVELOPMENT.md
- HTTPie examples provided
- Health check endpoint

### Automated Testing (Future)
- Bun test framework ready
- Mock database with docker-compose
- API integration tests
- Unit tests for calculations

## Deployment Strategies

### Development
```bash
bun run dev
```
Hot reload enabled.

### Production - Docker
```bash
docker-compose up -d
```
Includes PostgreSQL and backend.

### Production - VPS
```bash
pm2 start "bun run start"
```
With nginx reverse proxy.

### Production - Platform
Railway, Render, or Fly.io with one-click deploy.

## Monitoring & Logging

### Logging
- Console.log for development
- Errors logged to console
- Production: Consider winston or pino

### Health Checks
- `/health` endpoint
- Database connection verified on startup
- Docker health checks configured

### Metrics (Future)
- Request duration
- Error rates
- Database query times
- Active users

## Hybrid Data Storage

The app supports hybrid storage:

### Authenticated Users
- Data stored in PostgreSQL
- Persists across devices
- Requires login

### Anonymous Users (Frontend)
- Data in localStorage
- Device-specific
- Export function available

Backend provides API for authenticated users only. Frontend handles anonymous mode independently.
