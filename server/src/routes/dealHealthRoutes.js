const express = require('express');
const router = express.Router();
const {
  getDealHealthList,
  takeDealHealthAction
} = require('../controllers/dealHealthController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getDealHealthList);
router.post('/:id/action', protect, takeDealHealthAction);

module.exports = router;
