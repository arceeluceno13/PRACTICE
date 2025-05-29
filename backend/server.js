import express from 'express';
import cors from 'cors';
import mysql from 'mysql';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET

const app = express();
app.use(express.json());
app.use(cors());
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'practice_db'
})

app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  // Check for existing username only
  const checkSql = 'SELECT * FROM users WHERE username = ?';
  db.query(checkSql, [username], (err, data) => {
    if (err) {
      console.error("Check error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (data.length > 0) {
      return res.status(409).json({ message: "Username already exists" });
    }
    // If not exists, insert new user
    const insertSql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(insertSql, [username, email, password], (err, result) => {
      if (err) {
        console.error("Registration error:", err);
        return res.status(500).json({ message: "Registration failed", error: err });
      }
      return res.json({ message: "Registration successful" });
    });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM users WHERE username = ?';
  db.query(sql, [username], (err, data) => {
    if (err) {
      console.error("Login error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    if (data.length === 0) {
      return res.status(401).json({ message: "No record Found" });
    }
    const user = data[0];
    // Compare hashed password
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    return res.json({ message: "Login successful", token });
  });
});



app.listen(3000, () => {
  console.log('Server is running on port 3000');
})
