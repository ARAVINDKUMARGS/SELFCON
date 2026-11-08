const express = require('express');
const router = express.Router();
const { handleRazorpayWebhook, handleStripeWebhook } = require('../controllers/webhookController');

router.post('/razorpay', handleRazorpayWebhook);
router.post('/stripe', handleStripeWebhook);

module.exports = router;

