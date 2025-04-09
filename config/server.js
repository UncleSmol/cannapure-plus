require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require("./database");
const apiRoutes = require('./api/routes');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add path for middleware
app.use(express.static(path.join(__dirname, 'middleware')));

// API routes
app.use('/api', apiRoutes);

// Basic test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Legacy strain data routes
app.get('/api/strains', async (req, res) => {
  try {
    const strains = await db.query('SELECT * FROM strains');
    res.json(strains);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch strains' });
  }
});

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
});

module.exports = app;
