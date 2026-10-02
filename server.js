import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js'

dotenv.config();

console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET);

const app = express();
const port = process.env.PORT|| 5000;

app.use(express.json());
app.use(cors())
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('DB Connection Error:', err);
    } else {
        console.log('DB connected:', res.rows[0])
    }
});

app.get ('/' , (req, res) => {
    res.send('API Working');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});