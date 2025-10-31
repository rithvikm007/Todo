// Import required libraries
const express = require('express');
const jwt = require('jsonwebtoken'); // For verifying JWT tokens

const router = express.Router();

// In-memory storage for todos (resets on server restart)
const todos = [];
let todoIdCounter = 1; // Auto-incrementing ID for todos

// JWT secret (should match the one in auth.js)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-this';

// Middleware to verify JWT token and protect routes
function authMiddleware(req, res, next) {
  // Get the Authorization header
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'missing authorization header' });
  
  // Split "Bearer <token>" format
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'invalid authorization format' });
  }
  
  const token = parts[1];
  try {
    // Verify and decode the JWT token
    const payload = jwt.verify(token, JWT_SECRET);
    
    // Attach user info to request object for use in route handlers
    req.user = payload;
    
    // Continue to next middleware/route handler
    next();
  } catch (err) {
    // Token is invalid or expired
    return res.status(401).json({ error: 'invalid or expired token' });
  }
}

// GET /todos - List all todos for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  // Filter todos to only show the current user's items
  const mine = todos.filter(t => t.userId === req.user.userId);
  res.json(mine);
});

// POST /todos - Create a new todo
router.post('/', authMiddleware, async (req, res) => {
  // Extract title and body from request
  const { title, body } = req.body;
  
  // Validate required field
  if (!title) return res.status(400).json({ error: 'title required' });
  
  // Create new todo item with incremental ID and user association
  const item = { 
    id: todoIdCounter++, 
    title, 
    body: body || '', // Default to empty string if no body provided
    userId: req.user.userId, // Associate with authenticated user
    createdAt: new Date().toISOString() 
  };
  
  // Add to in-memory storage
  todos.push(item);
  
  // Return created item with 201 status
  res.status(201).json(item);
});

// GET /todos/:id - Get a specific todo by ID
router.get('/:id', authMiddleware, async (req, res) => {
  // Find todo by ID (converted from string to int) and verify ownership
  const item = todos.find(t => t.id === parseInt(req.params.id) && t.userId === req.user.userId);
  
  // Return 404 if not found or doesn't belong to user
  if (!item) return res.status(404).json({ error: 'not found' });
  
  res.json(item);
});

// PUT /todos/:id - Update an existing todo
router.put('/:id', authMiddleware, async (req, res) => {
  // Extract fields to update
  const { title, body } = req.body;
  
  // Find index of todo (verify ID and ownership)
  const idx = todos.findIndex(t => t.id === parseInt(req.params.id) && t.userId === req.user.userId);
  
  // Return 404 if not found
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  
  // Update fields if provided (allows partial updates)
  if (title !== undefined) todos[idx].title = title;
  if (body !== undefined) todos[idx].body = body;
  
  // Add timestamp for when it was updated
  todos[idx].updatedAt = new Date().toISOString();
  
  // Return updated item
  res.json(todos[idx]);
});

// DELETE /todos/:id - Delete a todo
router.delete('/:id', authMiddleware, async (req, res) => {
  // Find index of todo to delete
  const idx = todos.findIndex(t => t.id === parseInt(req.params.id) && t.userId === req.user.userId);
  
  // Return 404 if not found
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  
  // Remove from array and get the removed item
  const [removed] = todos.splice(idx, 1);
  
  // Return success confirmation with deleted item
  res.json({ success: true, item: removed });
});

module.exports = router;
