// Import required libraries
const express = require('express');
const authRoutes = require('./routes/auth'); // Auth endpoints (register, login)
const todosRoutes = require('./routes/todos'); // Todo CRUD endpoints

// Initialize Express app
const app = express();

// Get port from environment variable or default to 3000
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Mount route handlers
app.use('/auth', authRoutes); // All /auth/* endpoints
app.use('/todos', todosRoutes); // All /todos/* endpoints

// Root endpoint - simple info message
app.get('/', (req, res) => {
  res.send('Mini Todo API — see /auth and /todos');
});

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error(err); // Log error to console
  res.status(500).json({ error: 'internal error' });
});

// Start the server
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
