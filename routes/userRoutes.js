import express from 'express';
import { loginUser, registerUser } from '../controllers/usercontroller.js';
import { protect } from '../middleware/authmiddleware.js';

const router = express.Router();
router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/profile', protect, (req, res) => {
    res.status(200).json({ user: req.user });
});

export default router;