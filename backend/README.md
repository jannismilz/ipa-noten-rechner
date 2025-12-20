# Backend Documentation

## Setup

### Prerequisites
- [Bun](https://bun.sh/) runtime installed
- PostgreSQL database (or use Docker Compose)

### Installation

1. Install dependencies:
```bash
bun install
```

2. Configure environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your database credentials and JWT secret.

3. Run database migrations:
```bash
bun run migrate
```

4. (Optional) Seed the database:
```bash
bun run seed
```

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
