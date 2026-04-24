# 🪂 Airdrop Tracker Agent

A full-stack Web3 airdrop tracking tool with a background reminder agent, task management, and Telegram notifications.

---

## 🧱 Tech Stack

| Layer      | Tech                        |
|------------|-----------------------------|
| Backend    | Node.js + Express + TypeScript |
| Database   | MySQL                        |
| Frontend   | React + Vite + TypeScript    |
| Agent      | node-cron (background job)   |
| Alerts     | Telegram Bot (+ console fallback) |

---

## 📁 Project Structure

```
airdrop-tracker/
├── schema.sql                  ← MySQL schema + seed data
├── backend/
│   ├── src/
│   │   ├── index.ts            ← Express app entry
│   │   ├── config/
│   │   │   └── database.ts     ← MySQL pool config
│   │   ├── models/
│   │   │   └── types.ts        ← TypeScript interfaces
│   │   ├── services/
│   │   │   ├── airdropService.ts      ← DB queries
│   │   │   └── notificationService.ts ← Telegram / console
│   │   ├── controllers/
│   │   │   └── airdropController.ts
│   │   ├── routes/
│   │   │   └── index.ts
│   │   └── jobs/
│   │       └── reminderAgent.ts  ← Background cron job
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.tsx             ← Main application
    │   ├── main.tsx
    │   ├── index.css           ← Full styling
    │   ├── types/index.ts
    │   ├── hooks/useAirdrops.ts
    │   └── components/
    │       ├── AirdropCard.tsx
    │       ├── TaskModal.tsx
    │       └── Toast.tsx
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

---

## ⚙️ Setup & Run

### 1. MySQL Setup

```bash
# Start MySQL and run the schema
mysql -u root -p < schema.sql
```

This creates:
- `airdrop_tracker` database
- All tables: `users`, `airdrops`, `tasks`, `user_tasks`
- Seed data: 5 airdrops (LayerZero, zkSync, Scroll, Starknet, Linea) with tasks

---

### 2. Backend

```bash
cd backend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your MySQL credentials
```

**.env file:**
```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=airdrop_tracker
DEFAULT_USER_ID=1

# Optional Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

```bash
# Start development server
npm run dev
```

Server starts at: `http://localhost:3001`

---

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

App opens at: `http://localhost:5173`

---

## 🔌 API Reference

| Method | Endpoint                                  | Description              |
|--------|-------------------------------------------|--------------------------|
| GET    | `/api/airdrops`                           | All airdrops + progress  |
| POST   | `/api/airdrops/:id/tasks/:taskId/complete` | Mark task complete       |
| DELETE | `/api/airdrops/:id/tasks/:taskId/complete` | Unmark task              |
| GET    | `/api/user/progress`                      | User progress summary    |
| POST   | `/api/agent/trigger`                      | Manually trigger agent   |
| GET    | `/health`                                 | Health check             |

---

## 🤖 Reminder Agent

The background agent runs **every 60 seconds** and:
1. Queries airdrops with deadline within 24 hours
2. Checks task completion per airdrop
3. Sends notification via **Telegram** (if configured) or **console**

### Urgency Levels:
- 🚨 **URGENT** — less than 1 hour left
- ⚠️ **SOON** — 1–6 hours left
- 📢 **REMINDER** — 6–24 hours left

### Manual Trigger:
Click **"▶ TRIGGER NOW"** in the UI, or POST to `/api/agent/trigger`

---

## 📱 Telegram Setup (Optional)

1. Chat with [@BotFather](https://t.me/botfather) on Telegram
2. Create a new bot: `/newbot`
3. Copy the **bot token** → `TELEGRAM_BOT_TOKEN`
4. Start a chat with your bot, then get your chat ID:
   ```
   https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
   ```
5. Copy `chat.id` → `TELEGRAM_CHAT_ID`

---

## 🎯 Demo Flow

1. Open `http://localhost:5173`
2. View 5 seeded airdrops with deadlines
3. Click any card → task checklist opens
4. Check tasks off → progress bar updates live
5. Filter by **URGENT** to see time-critical drops
6. Click **▶ TRIGGER NOW** → watch server console for agent output
7. Stats bar updates as tasks are completed

---

## 🗄️ Database Schema

```sql
users         → id, username, telegram_chat_id
airdrops      → id, name, description, link, deadline, status
tasks         → id, airdrop_id, title, task_order
user_tasks    → id, user_id, task_id, airdrop_id, completed_at
```

---

## 📦 Build for Production

```bash
# Backend
cd backend && npm run build
node dist/index.js

# Frontend
cd frontend && npm run build
# Serve dist/ with any static server
```

---

## 🔧 Customization

- **Add more airdrops**: Edit `schema.sql` INSERT statements and re-run seed portion
- **Change check interval**: Edit `reminderAgent.ts` cron expression (`'* * * * *'` = every minute)
- **Adjust deadline thresholds**: Edit `getUpcomingDeadlines(24)` — change `24` to any hours
- **Multi-user**: Remove `DEFAULT_USER_ID` and add JWT auth middleware

---

Built for Web3 Builder Challenge 🏆