import express from 'express';
import { protect } from '../middleware/authmiddleware.js';
import { generatePaymentQR, confirmPayment, generateAbaQR, abaCallback } from '../controllers/paymentcontroller.js';

const router = express.Router();

router.post('/:orderId/qr', protect, generatePaymentQR);
router.post('/:orderId/confirm', protect, confirmPayment);
router.post('/:orderId/aba-qr', protect, generateAbaQR);
router.post('/aba-callback', abaCallback);

export default router;