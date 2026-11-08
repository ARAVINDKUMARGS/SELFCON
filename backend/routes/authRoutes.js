const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateDetails,
  switchRole,
  updatePassword,
  forgotPassword,
  resetPassword,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/switch-role', protect, switchRole);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;

