// Import required libraries
const express = require('express');
const bcrypt = require('bcryptjs'); // For hashing passwords securely
const jwt = require('jsonwebtoken'); // For creating and verifying JWT tokens

const router = express.Router();

// In-memory storage for users (resets on server restart)
const users = [];
let userIdCounter = 1; // Auto-incrementing ID for users

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-this'; // Secret key for signing tokens
const TOKEN_EXPIRES = '8h'; // Token validity duration

// POST /auth/register - Create a new user account
router.post('/register', async (req, res) => {
  // Extract username and password from request body
  const { username, password } = req.body;
  
  // Validate that both fields are provided
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });

  // Check if username already exists
  if (users.find(u => u.username === username)) return res.status(409).json({ error: 'username taken' });

  // Hash the password (bcrypt with 10 salt rounds)
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Create new user object with incremental ID
  const user = { id: userIdCounter++, username, passwordHash };
  
  // Add user to in-memory storage
  users.push(user);
  
  // Generate JWT token with user info
  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });
  
  // Return token and user info (without password hash)
  res.json({ token, user: { id: user.id, username: user.username } });
});

// POST /auth/login - Authenticate existing user
router.post('/login', async (req, res) => {
  // Extract credentials from request body
  const { username, password } = req.body;
  
  // Validate that both fields are provided
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });

  // Find user by username
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: 'invalid credentials' });

  // Verify password matches the stored hash
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });

  // Generate JWT token for authenticated user
  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });
  
  // Return token and user info
  res.json({ token, user: { id: user.id, username: user.username } });
});

module.exports = router;
