import pool from '../config/db.js';

export const checkout = async (req, res) => {
    try {
        const userId = req.user.id;

        const cartResult = await pool.query(
            `SELECT ci.product_id, ci.quantity, p.price, p.stock
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.user_id = $1`,
            [userId]
        );

        const cartItems = cartResult.rows;

        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty' });
        }

        for (const item of cartItems) {
            if (item.stock < item.quantity) {
                return res.status(400).json({ message: `Not enough stock for product ${item.product_id}` });
            }
        }

        const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const orderResult = await pool.query(
            `INSERT INTO orders (user_id, total_price, status)
             VALUES ($1, $2, 'pending')
             RETURNING *`,
            [userId, totalPrice]
        );
        const order = orderResult.rows[0];

        for (const item of cartItems) {
            await pool.query(
                `INSERT INTO order_items (order_id, product_id, quantity, price)
                 VALUES ($1, $2, $3, $4)`,
                [order.id, item.product_id, item.quantity, item.price]
            );

            await pool.query(
                `UPDATE products SET stock = stock - $1 WHERE id = $2`,
                [item.quantity, item.product_id]
            );
        }

        await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

        return res.status(201).json({ message: 'Order placed', order });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

