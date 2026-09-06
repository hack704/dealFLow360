const express = require('express');
const router = express.Router();
const { register, login, magicLinkLogin, getMe, getUsers, updateUserRole } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/magic-link', magicLinkLogin);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('admin'), getUsers);
router.patch('/users/:id/role', protect, authorize('admin'), updateUserRole);

module.exports = router;
