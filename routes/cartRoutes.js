import express from 'express';
import { protect } from '../middleware/authmiddleware.js';
import { addToCart, getCart, removeFromCart, updateCartItem } from '../controllers/cartcontroller.js';

const router = express.Router();

router.post('/', protect, addToCart);
router.get('/', protect, getCart);
router.put('/:productId', protect, updateCartItem);
router.delete('/:productId', protect, removeFromCart);

export default router;