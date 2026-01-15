# Backend Documentation

## Commands

### Development
```bash
bun run dev
```
Starts the server with hot reload on port 3001.

### Production
```bash
bun run start
```

### Database
```bash
bun run migrate    # Run database migrations
bun run seed       # Seed database with sample data
```

### User Management
```bash
bun run create-user
```
Interactive CLI to create a new user.

### Testing
```bash
bun test              # Run all tests
bun test --watch      # Run tests in watch mode
```
See [TESTING.md](./TESTING.md) for detailed testing documentation.

## Docker

Start the backend with PostgreSQL:
```bash
docker-compose up -d
```

Stop services:
```bash
docker-compose down
```

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/evaluations` - Get user evaluations
- `POST /api/evaluations/ticked-requirements` - Save ticked requirements
- `POST /api/evaluations/criteria-notes` - Save criteria notes

All endpoints except `/auth/*` require JWT authentication via `Authorization: Bearer <token>` header.
