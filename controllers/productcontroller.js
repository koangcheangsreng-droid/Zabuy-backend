import pool from '../config/db.js';

export const getAllProducts = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, image_url } = req.body;

        if (!name || !price) {
            return res.status(400).json({ message: 'Please provide at least a name and price' });
        }

        const result = await pool.query(
            `INSERT INTO products (name, description, price, stock, image_url)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [name, description, price, stock || 0, image_url]
        );

        res.status(201).json({ message: 'Product created', product: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, stock, image_url } = req.body;

        const result = await pool.query(
            `UPDATE products
             SET name = $1, description = $2, price = $3, stock = $4, image_url = $5
             WHERE id = $6
             RETURNING *`,
            [name, description, price, stock, image_url, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product updated', product: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};