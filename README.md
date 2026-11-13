# Practice app

React/Vite frontend with Redux Toolkit state management and a Node.js/Express API backed by MySQL. Authentication supports registration, login, protected routes, and a revocable logout flow.

## Requirements

- Node.js 18 or newer
- MySQL 8 or compatible MySQL server

## Backend setup

```bash
cd backend
cp .env.example .env
# Update DB settings and JWT_SECRET in .env
npm install
npm run dev
```

The server creates the `users` and `auth_sessions` tables automatically on startup. A manual schema is also available in `backend/schema.sql`.

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Vite proxies `/api` requests to the Express server running at `http://localhost:3000`.

## Authentication API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

Passwords are hashed with bcrypt, and logout invalidates the current session in MySQL using a stored token hash.
