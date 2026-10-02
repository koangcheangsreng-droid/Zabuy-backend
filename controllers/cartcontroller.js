import pool from '../config/db.js';

export const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity = 1 } = req.body;

        if (!productId || quantity < 1) {
            return res.status(400).json({ message: 'Please provide a productId and a valid quantity' });
        }

        const product = await pool.query('SELECT id, stock FROM products WHERE id = $1', [productId]);

        if (product.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.rows[0].stock < quantity) {
            return res.status(400).json({ message: 'Not enough stock' });
        }

        const result = await pool.query(
            `INSERT INTO cart_items (user_id, product_id, quantity)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, product_id)
             DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
             RETURNING *`,
            [userId, productId, quantity]
        );

        return res.status(201).json({ message: 'Added to cart', item: result.rows[0] });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.price, p.image_url
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.user_id = $1`,
            [userId]
        );

        return res.status(200).json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateCartItem = async (req, res) => {    try{
        const userId = req.user.id;
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: 'Please provide a valid quantity' });
        }

        const result = await pool.query(
            `UPDATE cart_items
            SET quantity = $1
            WHERE user_id = $2 AND product_id = $3
            RETURNING *`,
            [quantity, userId, productId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        return res.status(200).json({ message: 'Cart item updated', item: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

export const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        await pool.query(
            'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2',
            [userId, productId]
        );

        return res.status(200).json({ message: 'Item removed from cart' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};