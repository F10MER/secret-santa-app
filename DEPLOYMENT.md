# Secret Santa Telegram Mini App - Deployment Guide

This guide explains how to deploy the Secret Santa application to Easypanel.

## Prerequisites

- Easypanel instance running
- GitHub account
- Telegram Bot Token (from @BotFather)

## Quick Start with Easypanel

### Option 1: Deploy from GitHub (Recommended)

1. **Push code to GitHub** (see instructions below)

2. **In Easypanel:**
   - Create new project → "From GitHub"
   - Select your repository
   - Choose "Docker Compose" deployment method
   - Easypanel will automatically detect `docker-compose.yml`

3. **Set Environment Variables:**
   ```
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   DB_PASSWORD=your_secure_database_password
   JWT_SECRET=your_random_secret_key
   VITE_APP_URL=https://your-domain.com
   ```

4. **Deploy!**
   - Click "Deploy" button
   - Wait for build to complete
   - Your app will be available at the assigned URL

### Option 2: Manual Docker Deployment

1. **Clone repository on your server:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/secret-santa-app.git
   cd secret-santa-app
   ```

2. **Create `.env` file:**
   ```bash
   cp .env.example .env
   nano .env  # Edit with your values
   ```

3. **Start with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

4. **Check logs:**
   ```bash
   docker-compose logs -f app
   ```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `TELEGRAM_BOT_TOKEN` | Token from @BotFather | `123456:ABC-DEF...` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret key for JWT tokens | Any random string |
| `VITE_APP_URL` | Public URL of your app | `https://santa.example.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Application port | `3000` |
| `VITE_APP_TITLE` | Application title | `Secret Santa` |
| `NODE_ENV` | Environment | `production` |

## Database Setup

The `docker-compose.yml` automatically creates a PostgreSQL database.

**IMPORTANT:** Migrations must be run manually ONCE after first deployment.

### Run Migrations (Required - ONE TIME ONLY)

After first deployment, run migrations:

**Via Easypanel Console:**
```bash
cd /app
pnpm install drizzle-kit --save-dev
pnpm db:push
```

**Via Docker exec:**
```bash
docker exec -it <container-name> sh
cd /app
pnpm install drizzle-kit --save-dev
pnpm db:push
```

### Verify Database Tables

```bash
# Connect to database
docker exec -it secret-santa-db psql -U secret_santa_user -d secret_santa

# Check tables (should see: users, santa_events, event_participants, etc.)
\dt

# Exit
\q
```

## Telegram Bot Configuration

1. **Get Bot Token:**
   - Message @BotFather in Telegram
   - Send `/newbot`
   - Follow instructions
   - Copy the token

2. **Set Bot Commands:**
   ```
   /start - Start the bot
   /help - Show help message
   /stats - View your statistics
   ```

3. **Set WebApp URL:**
   - In @BotFather, send `/setmenubutton`
   - Select your bot
   - Send button text: "Open App"
   - Send WebApp URL: `https://your-domain.com`

## Health Checks

- Application: `http://your-domain.com/health`
- Database: Automatic via Docker healthcheck

## Troubleshooting

### Bot not responding
- Check `TELEGRAM_BOT_TOKEN` is correct
- Check logs: `docker-compose logs -f app`
- Ensure only one bot instance is running

### Database connection errors
- Check `DATABASE_URL` is correct
- Verify PostgreSQL container is running: `docker ps`
- Check database logs: `docker-compose logs -f postgres`

### Build failures
- Ensure all dependencies are in `package.json`
- Check Node.js version (requires 22+)
- Clear Docker cache: `docker-compose build --no-cache`

## Updating the Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# Check logs
docker-compose logs -f app
```

## Backup

### Database Backup
```bash
docker exec secret-santa-db pg_dump -U secret_santa_user secret_santa > backup.sql
```

### Restore Database
```bash
cat backup.sql | docker exec -i secret-santa-db psql -U secret_santa_user -d secret_santa
```

## Security Recommendations

1. **Change default passwords** in `.env`
2. **Use strong JWT_SECRET** (at least 32 random characters)
3. **Enable HTTPS** (Easypanel handles this automatically)
4. **Keep bot token secret** - never commit to Git
5. **Regular backups** of database

## Support

For issues or questions:
- Check logs first: `docker-compose logs -f`
- Review this deployment guide
- Check Telegram bot configuration

## Architecture

```
┌─────────────────┐
│  Telegram Bot   │
│   (@moisanta)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│   Node.js App   │◄────►│  PostgreSQL  │
│  (Port 3000)    │      │   Database   │
└─────────────────┘      └──────────────┘
         │
         ▼
┌─────────────────┐
│  Telegram Mini  │
│   App (React)   │
└─────────────────┘
```

## Next Steps

After deployment:
1. Test bot commands in Telegram
2. Open WebApp from bot menu
3. Test all features (Secret Santa, Wishlist, Calendar)
4. Share bot with users!
