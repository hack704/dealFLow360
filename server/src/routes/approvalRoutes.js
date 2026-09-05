const express = require('express');
const router = express.Router();
const {
  getApprovalsQueue,
  getApprovalDetails,
  submitForApproval,
  takeApprovalAction
} = require('../controllers/approvalController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getApprovalsQueue);

router.post('/submit', protect, submitForApproval);

router.route('/:id')
  .get(getApprovalDetails);

router.post('/:id/action', protect, takeApprovalAction);

module.exports = router;
