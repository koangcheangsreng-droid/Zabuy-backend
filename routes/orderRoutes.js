import express from 'express';
import { protect } from '../middleware/authmiddleware.js';
import { checkout } from '../controllers/ordercontroller.js';

const router = express.Router();

router.post('/checkout', protect, checkout);

export default router;