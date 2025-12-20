# IPA Noten Rechner - Backend

ExpressJS backend powered by Bun runtime for the IPA grading calculator.

## Tech Stack

- **Runtime**: Bun
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT with bcryptjs

## Project Structure

```
backend/
├── src/
│   ├── db/
│   │   ├── connection.js      # Database connection
│   │   ├── migrate.js         # Database migrations
│   │   └── seed.js            # Seed data
│   ├── middleware/
│   │   ├── auth.js            # Authentication middleware
│   │   └── errorHandler.js   # Error handling
│   ├── routes/
│   │   ├── auth.js            # Authentication endpoints
│   │   ├── users.js           # User profile management
│   │   └── evaluations.js    # Criteria evaluation
│   └── index.js               # Application entry point
├── .env                       # Environment variables
├── package.json
└── README.md
```

## Prerequisites

- [Bun](https://bun.sh) >= 1.0.0
- PostgreSQL >= 14

## Development Setup

### 1. Install Bun

```bash
curl -fsSL https://bun.sh/install | bash
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Configure Database

Create a PostgreSQL database:

```bash
createdb ipa_noten_rechner
```

Update `.env` with your database credentials:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ipa_noten_rechner
DB_USER=postgres
DB_PASSWORD=your_password

PORT=3001
NODE_ENV=development

JWT_SECRET=your-secret-key-change-in-production
```

### 4. Run Migrations

```bash
bun run migrate
```

### 5. Seed Database (Optional)

Creates an admin user for testing:

```bash
bun run seed
```

Default credentials:
- Email: `admin@example.com`
- Password: `admin123`

### 6. Start Development Server

```bash
bun run dev
```

Server runs on `http://localhost:3001`

## API Endpoints

### Authentication

**POST** `/api/auth/register`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**POST** `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Returns:
```json
{
  "token": "jwt-token",
  "userId": 1
}
```

### User Profile

**GET** `/api/users/profile`

Headers: `Authorization: Bearer <token>`

**PUT** `/api/users/profile`

Headers: `Authorization: Bearer <token>`

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "thesisTopic": "My IPA Project",
  "submissionDate": "2024-06-30",
  "onboardingCompleted": true
}
```

### Evaluations

**GET** `/api/evaluations/criteria`

Returns all criteria from `criterias.json`

**GET** `/api/evaluations`

Headers: `Authorization: Bearer <token>`

Returns user's evaluation progress

**POST** `/api/evaluations/:criteriaId`

Headers: `Authorization: Bearer <token>`

```json
{
  "fulfilledRequirements": {
    "0": true,
    "1": false,
    "2": true
  },
  "notes": "Additional notes",
  "selectedOption": 1
}
```

**GET** `/api/evaluations/calculate`

Headers: `Authorization: Bearer <token>`

Returns calculated scores and final grade

## Production Deployment

### Docker

Create `Dockerfile`:

```dockerfile
FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --production

COPY . .

EXPOSE 3001

CMD ["bun", "run", "start"]
```

Build and run:

```bash
docker build -t ipa-backend .
docker run -p 3001:3001 --env-file .env ipa-backend
```

### Traditional Server

1. Install Bun on server
2. Clone repository
3. Set environment variables
4. Install dependencies: `bun install`
5. Run migrations: `bun run migrate`
6. Start with process manager:

```bash
# Using PM2
pm2 start "bun run start" --name ipa-backend

# Using systemd
sudo systemctl enable ipa-backend
sudo systemctl start ipa-backend
```

### Environment Variables (Production)

```
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=ipa_noten_rechner
DB_USER=your-db-user
DB_PASSWORD=your-secure-password

PORT=3001
NODE_ENV=production

JWT_SECRET=generate-a-secure-random-secret-key
```

Generate secure JWT secret:

```bash
openssl rand -base64 64
```

## Database Migrations

To add new migrations, create a new migration file in `src/db/migrate.js` and run:

```bash
bun run migrate
```

## Testing

Health check endpoint:

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{"status": "ok"}
```

## Performance Notes

Bun provides:
- **Fast startup**: ~3x faster than Node.js
- **Low memory usage**: ~50% less than Node.js
- **Built-in TypeScript**: No additional tooling needed
- **Fast package manager**: Significantly faster than npm/yarn

## Troubleshooting

### Database Connection Issues

Check PostgreSQL is running:
```bash
pg_isready
```

Verify credentials in `.env` match your database setup.

### Port Already in Use

Change `PORT` in `.env` or kill the process:
```bash
lsof -ti:3001 | xargs kill -9
```

### Migration Errors

Drop and recreate database:
```bash
dropdb ipa_noten_rechner
createdb ipa_noten_rechner
bun run migrate
```

## License

ISC
