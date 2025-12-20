# Deployment Guide

## Production Deployment Options

### Option 1: Docker Deployment (Recommended)

#### Prerequisites
- Docker installed on server
- PostgreSQL database (can be containerized)

#### Steps

1. Create `Dockerfile` in backend root:

```dockerfile
FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --production

COPY . .

EXPOSE 3001

CMD ["bun", "run", "start"]
```

2. Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ipa_noten_rechner
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: ipa_noten_rechner
      DB_USER: postgres
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    depends_on:
      - postgres

volumes:
  postgres_data:
```

3. Create `.env.production`:

```
DB_PASSWORD=secure-random-password
JWT_SECRET=generate-with-openssl-rand-base64-64
```

4. Deploy:

```bash
docker-compose --env-file .env.production up -d
```

5. Run migrations:

```bash
docker-compose exec backend bun run migrate
docker-compose exec backend bun run seed
```

### Option 2: VPS Deployment (Ubuntu/Debian)

#### Prerequisites
- Ubuntu 20.04+ or Debian 11+
- Root or sudo access

#### Steps

1. **Install Bun**:

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```

2. **Install PostgreSQL**:

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

3. **Create Database**:

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE ipa_noten_rechner;
CREATE USER ipauser WITH PASSWORD 'secure-password';
GRANT ALL PRIVILEGES ON DATABASE ipa_noten_rechner TO ipauser;
\q
```

4. **Clone and Setup Application**:

```bash
cd /opt
sudo git clone <your-repo-url> ipa-backend
cd ipa-backend/backend
sudo chown -R $USER:$USER .
bun install
```

5. **Configure Environment**:

```bash
cp .env.example .env
nano .env
```

Update with production values.

6. **Run Migrations**:

```bash
bun run migrate
bun run seed
```

7. **Setup PM2 Process Manager**:

```bash
npm install -g pm2
pm2 start "bun run start" --name ipa-backend
pm2 save
pm2 startup
```

8. **Configure Nginx Reverse Proxy**:

```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/ipa-backend
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/ipa-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

9. **Setup SSL with Let's Encrypt**:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 3: Platform as a Service (Railway, Render, Fly.io)

#### Railway

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Initialize:
```bash
railway login
railway init
```

3. Add PostgreSQL:
```bash
railway add postgres
```

4. Deploy:
```bash
railway up
```

5. Set environment variables in Railway dashboard

6. Run migrations:
```bash
railway run bun run migrate
```

#### Render

1. Connect GitHub repository to Render
2. Create new Web Service
3. Configure:
   - Build Command: `bun install`
   - Start Command: `bun run start`
4. Add PostgreSQL database
5. Set environment variables
6. Deploy

## Post-Deployment

### Verify Deployment

```bash
curl https://your-domain.com/health
```

Expected: `{"status":"ok"}`

### Monitor Logs

**Docker**:
```bash
docker-compose logs -f backend
```

**PM2**:
```bash
pm2 logs ipa-backend
```

### Backup Database

```bash
# Docker
docker-compose exec postgres pg_dump -U postgres ipa_noten_rechner > backup.sql

# VPS
pg_dump -U ipauser ipa_noten_rechner > backup.sql
```

### Restore Database

```bash
# Docker
docker-compose exec -T postgres psql -U postgres ipa_noten_rechner < backup.sql

# VPS
psql -U ipauser ipa_noten_rechner < backup.sql
```

## Security Checklist

- [ ] Change default database password
- [ ] Generate secure JWT_SECRET (64+ characters)
- [ ] Enable SSL/HTTPS
- [ ] Configure CORS for specific origins
- [ ] Setup firewall (UFW on Ubuntu)
- [ ] Regular database backups
- [ ] Keep dependencies updated
- [ ] Use environment variables (never commit secrets)
- [ ] Enable rate limiting
- [ ] Setup monitoring (e.g., PM2, Datadog)

## Updating Deployment

```bash
# Pull latest changes
git pull origin main

# Install dependencies
bun install

# Run migrations
bun run migrate

# Restart service
pm2 restart ipa-backend
# OR
docker-compose restart backend
```

## Rollback

```bash
git checkout <previous-commit-hash>
bun install
pm2 restart ipa-backend
```

## Performance Optimization

1. **Database Indexing**: Already configured in migrations
2. **Connection Pooling**: Handled by postgres library
3. **Caching**: Consider Redis for session/token cache
4. **CDN**: Use for static assets
5. **Load Balancing**: Multiple instances with nginx

## Monitoring

### Health Checks

Add to cron:
```bash
*/5 * * * * curl -f https://your-domain.com/health || echo "Backend down"
```

### Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- StatusCake

### Application Monitoring

- PM2 Plus
- New Relic
- DataDog
