# 🎅 Secret Santa Telegram Mini App

A comprehensive Telegram Mini App for organizing Secret Santa events, managing wishlists, and coordinating gift exchanges with friends and family.

[![Deploy](https://img.shields.io/badge/Deploy-Easypanel-blue)](https://easypanel.io)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen)](https://nodejs.org)

## ✨ Features

### 🎁 Secret Santa Events
- Create and manage Secret Santa events with customizable budgets
- Add participants (real users or mock names for testing)
- Automatic random assignment algorithm ensuring everyone gives and receives
- View your assigned recipient secretly

### 📝 Wishlist Management
- Create personal wishlist with images and descriptions
- Privacy controls (Public / Friends Only)
- Share wishlist via unique links
- Image upload with 5MB size limit

### 🔖 Gift Reservations
- Browse friends' wishlists
- Reserve gifts secretly (hidden from wishlist owner)
- View all your reservations in one place
- Set deadlines for gift preparation
- Cancel reservations anytime

### 📅 Calendar Integration
- Visual calendar showing all deadlines and events
- Color-coded events (deadlines vs. Secret Santa events)
- Export to device calendar (.ics format)
- Compatible with Google Calendar, Apple Calendar, Outlook
- Urgency indicators (overdue, today, upcoming)

### 🎲 Randomizers
- **Dice Roller**: Roll dice with animated results (1-6)
- **Roulette**: Customizable wheel with 3-100 participants

### 🤖 Telegram Bot Integration
- Commands: `/start`, `/help`, `/stats`
- Notifications for events and assignments
- WebApp button for easy access

### 🌐 Internationalization
- Full support for English and Russian
- Easy to add more languages

## 🚀 Quick Start

### Prerequisites

- Node.js 22+
- PostgreSQL 16+
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- (Optional) Docker & Docker Compose

### Installation

#### Option 1: Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/F10MER/secret-santa-app.git
cd secret-santa-app
```

2. Create `.env` file:
```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
DB_PASSWORD=your_secure_password
JWT_SECRET=your_random_secret_key
VITE_APP_URL=https://your-domain.com
```

3. Start the application:
```bash
docker-compose up -d
```

4. Check logs:
```bash
docker-compose logs -f app
```

#### Option 2: Manual Installation

1. Clone and install dependencies:
```bash
git clone https://github.com/F10MER/secret-santa-app.git
cd secret-santa-app
npm install -g pnpm
pnpm install
```

2. Set up PostgreSQL database and create `.env` file with `DATABASE_URL`

3. Run database migrations:
```bash
pnpm db:push
```

4. Build and start:
```bash
pnpm build
pnpm start
```

## 📦 Deployment to Easypanel

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

**Quick steps:**
1. Create new project in Easypanel → "From GitHub"
2. Select this repository
3. Choose "Docker Compose" method
4. Set environment variables
5. Deploy!

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Backend**: Node.js, tRPC, Express
- **Database**: PostgreSQL, Drizzle ORM
- **Bot**: grammy (Telegram Bot Framework)
- **Build**: Vite, pnpm
- **Deployment**: Docker, Docker Compose

## 📱 Bot Setup

1. Create bot with [@BotFather](https://t.me/botfather):
```
/newbot
```

2. Set bot commands:
```
/setcommands

start - Start the bot
help - Show help message
stats - View your statistics
```

3. Set WebApp button:
```
/setmenubutton
```
- Button text: "Open App"
- WebApp URL: `https://your-domain.com`

## 🗂️ Project Structure

```
secret-santa-app/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts
│   │   ├── lib/           # Utilities and helpers
│   │   └── i18n.ts        # Translations
│   └── public/            # Static assets
├── server/                # Backend Node.js app
│   ├── _core/             # Server core
│   ├── routers.ts         # tRPC API routes
│   ├── db.ts              # Database helpers
│   └── bot.ts             # Telegram bot
├── drizzle/               # Database schema
│   └── schema.ts
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose setup
└── DEPLOYMENT.md          # Deployment guide
```

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Yes | Bot token from @BotFather |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret key for JWT tokens |
| `VITE_APP_URL` | Yes | Public URL of your app |
| `PORT` | No | Application port (default: 3000) |
| `NODE_ENV` | No | Environment (default: production) |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Manus AI](https://manus.im)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Telegram Bot Framework: [grammy](https://grammy.dev)

## 📞 Support

For issues or questions:
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment help
- Review application logs
- Open an issue on GitHub

## 🎯 Roadmap

- [ ] Push notifications for event reminders
- [ ] Group chats for Secret Santa events
- [ ] Gift ideas gallery
- [ ] QR code sharing for wishlists
- [ ] Mobile app (React Native)

---

Made with ❤️ for organizing perfect Secret Santa events!
