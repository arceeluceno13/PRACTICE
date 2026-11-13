import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import mysql from 'mysql';
import crypto from 'node:crypto';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  console.error('JWT_SECRET is required. Set it in backend/.env before starting the API.');
  process.exit(1);
}

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'practice_db',
});

const query = (sql, values = []) =>
  new Promise((resolve, reject) => {
    pool.query(sql, values, (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '10kb' }));

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

async function requireAuth(req, res, next) {
  const [scheme, token] = (req.get('authorization') || '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const user = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
    const sessions = await query(
      'SELECT user_id FROM auth_sessions WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > NOW()',
      [hashToken(token)],
    );

    if (!sessions.length || sessions[0].user_id !== user.id) {
      return res.status(401).json({ message: 'Session expired or logged out' });
    }

    req.auth = { user, token };
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    return next(error);
  }
}

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (username.length < 3 || username.length > 100 || !/^[\w.-]+$/.test(username)) {
      return res.status(400).json({ message: 'Username must be 3–100 characters and use letters, numbers, dots, underscores, or hyphens.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }

    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({ message: 'Password must be between 8 and 72 characters.' });
    }

    const existing = await query('SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1', [username, email]);
    if (existing.length) {
      return res.status(409).json({ message: 'Username or email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, passwordHash]);

    return res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Username or email is already registered.' });
    }
    return next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const users = await query('SELECT id, username, email, password FROM users WHERE username = ? LIMIT 1', [username]);

    if (!users.length || !(await bcrypt.compare(password, users[0].password))) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const user = users[0];
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      jwtSecret,
      { algorithm: 'HS256', expiresIn: '1h' },
    );

    const payload = jwt.decode(token);
    const expiresAt = payload && typeof payload.exp === 'number' ? new Date(payload.exp * 1000) : new Date(Date.now() + 60 * 60 * 1000);

    await query(
      'INSERT INTO auth_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
      [hashToken(token), user.id, expiresAt],
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const { id, username, email } = req.auth.user;
  return res.json({ user: { id, username, email } });
});

app.post('/api/auth/logout', requireAuth, async (req, res, next) => {
  try {
    await query('UPDATE auth_sessions SET revoked_at = NOW() WHERE token_hash = ? AND revoked_at IS NULL', [hashToken(req.auth.token)]);
    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    return next(error);
  }
});

app.use((error, req, res, next) => {
  console.error('API error:', error.message);
  if (res.headersSent) return next(error);
  return res.status(500).json({ message: 'Internal server error' });
});

async function initializeDatabase() {
  await query(`CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await query(`CREATE TABLE IF NOT EXISTS auth_sessions (
    token_hash CHAR(64) NOT NULL PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    expires_at DATETIME NOT NULL,
    revoked_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX auth_sessions_user_id_idx (user_id),
    CONSTRAINT auth_sessions_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
}

async function startServer() {
  await initializeDatabase();
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error('Unable to connect to MySQL or initialize the database:', error.message);
  process.exit(1);
});
