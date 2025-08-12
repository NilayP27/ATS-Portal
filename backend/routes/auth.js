const express = require('express');
const passport = require('passport');
const router = express.Router();
const {
  signup,
  login,
  requestResetCode,
  resetPassword
} = require('../controllers/authControllers');

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/request-reset', requestResetCode);
router.post('/reset-password', resetPassword);

// Optional: Get currently logged-in user's profile
router.get(
  '/me',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      email: req.user.email,
      username: req.user.username,
      role: req.user.role,
      department: req.user.department || null,
      title: req.user.title || null
    });
  }
);

module.exports = router;
