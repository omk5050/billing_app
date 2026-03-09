const express = require('express');
const router = express.Router();

const { register, login, logout } = require('./auth.controller');
const { protect, authorize } = require('../../middleware/auth.middleware');

router.get('/admin-only', protect, authorize('admin'), (req, res) => {
  res.json({ message: 'Welcome Admin' });
});

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);

router.get('/me', protect, (req, res) => {
  res.json({
    message: 'Protected route accessed',
    user: req.user
  });
});

module.exports = router;