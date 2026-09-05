const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Framework middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'DealFlow360 API server running'
  });
});

// Mount modular API routes
app.use('/api', routes);

// Centralized error handling
app.use(errorHandler);

module.exports = app;
