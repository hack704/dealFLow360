const express = require('express');
const router = express.Router();
const { getCustomers, getCustomerById, createCustomer } = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getCustomers)
  .post(protect, createCustomer);

router.route('/:id')
  .get(getCustomerById);

module.exports = router;
