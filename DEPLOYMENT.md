# PriceHunt — Deployment Guide

## 1. Prerequisites

- **Node.js**: >= 18.0.0
- **MySQL**: MySQL Server running on **Port 3308**
- **Redis**: (Optional, Redis Cloud or local Redis. Falls back to in-memory caching if omitted.)

---

## 2. Environment Setup

Copy and configure the environment variables in `server/.env`:

```bash
cd server
cp .env.example .env
```

Ensure MySQL configuration and `JWT_SECRET` are properly configured:
```env
PORT=5000
DB_TYPE=mysql
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3308
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=pricehunt
JWT_SECRET=production_strong_secret_key_32_characters_minimum
CLIENT_URL=http://localhost:5173
```

---

## 3. Database Migration & Seeding

Run the migration script to apply schema indexes, seed categories, stores, and admin credentials:

```bash
cd server
npm run migrate
```

Check migration status:
```bash
npm run migrate:status
```

Default Admin Account:
- **Email**: `admin@pricehunt.com`
- **Password**: `Admin@12345`

---

## 4. Running the Application

### Start Backend API
```bash
cd server
npm start
# Server listens at http://localhost:5000
```

### Start Frontend Application
```bash
cd client
npm run build
npm run preview
# Or for development:
# npm run dev
```

---

## 5. Production Health Check

Visit `http://localhost:5000/health`:
```json
{
  "status": "healthy",
  "uptime": 125,
  "database": {
    "status": "connected",
    "name": "pricehunt"
  },
  "cache": {
    "status": "in-memory"
  }
}
```
