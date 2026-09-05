const express = require('express');
const cors = require('cors');

const app = express();

// Framework middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check route for infrastructure verification
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'DealFlow360 API server running'
  });
});

module.exports = app;
