const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  requestResetCode,
  resetPassword
} = require('../controllers/authControllers');

router.post('/signup', signup);
router.post('/login', login);
router.post('/request-reset', requestResetCode);
router.post('/reset-password', resetPassword);

module.exports = router;
