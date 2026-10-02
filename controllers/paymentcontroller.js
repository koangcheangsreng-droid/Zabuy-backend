import pool from '../config/db.js';
import { BakongKHQR, khqrData, IndividualInfo } from 'bakong-khqr';
import crypto from 'crypto';

export const generatePaymentQR = async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;

        const orderResult = await pool.query(
            'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
            [orderId, userId]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const order = orderResult.rows[0];

        const individualInfo = new IndividualInfo(
            'your_bakong_id@xxx',
            khqrData.currency.usd,
            'Zabuy Store',
            'Phnom Penh',
            {
                amount: parseFloat(order.total_price)
            }
        );

        const khqr = new BakongKHQR();
        const response = khqr.generateIndividual(individualInfo);

        if (response.status.code !== 0) {
            console.error('KHQR error:', response.status.message);
            return res.status(400).json({ message: response.status.message });
        }

        return res.status(200).json({
            qr: response.data.qr,
            md5: response.data.md5
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const confirmPayment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;

        const result = await pool.query(
            `UPDATE orders
             SET status = 'paid'
             WHERE id = $1 AND user_id = $2
             RETURNING *`,
            [orderId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        return res.status(200).json({ message: 'Payment confirmed', order: result.rows[0] });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const generateAbaQR = async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;

        const orderResult = await pool.query(
            'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
            [orderId, userId]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const order = orderResult.rows[0];

        const req_time = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
        const merchant_id = process.env.ABA_MERCHANT_ID?.trim();
        const tran_id = `order${order.id}-${Date.now()}`;
        const amount = order.total_price;
        const currency = 'USD';
        const payment_option = 'abapay_khqr';
        const lifetime = 30;
        const qr_image_template = 'template3_color';

        const items = '';
        const first_name = '';
        const last_name = '';
        const email = '';
        const phone = '';
        const purchase_type = 'purchase';
        const callback_url = Buffer.from(process.env.ABA_CALLBACK_URL || '').toString('base64');
        const return_deeplink = '';
        const custom_fields = '';
        const return_params = '';
        const payout = '';

        const b4hash = req_time + merchant_id + tran_id + amount + items + first_name + last_name +
            email + phone + purchase_type + payment_option + callback_url + return_deeplink +
            currency + custom_fields + return_params + payout + lifetime + qr_image_template;

        const hash = crypto
            .createHmac('sha512', (process.env.ABA_API_KEY || '').trim())
            .update(b4hash)
            .digest('base64');

        const response = await fetch('https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/generate-qr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                req_time,
                merchant_id,
                tran_id,
                amount,
                items,
                first_name,
                last_name,
                email,
                phone,
                purchase_type,
                payment_option,
                callback_url,
                return_deeplink,
                currency,
                custom_fields,
                return_params,
                payout,
                lifetime,
                qr_image_template,
                hash
            })
        });

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const abaCallback = async (req, res) => {
    try {
        const { tran_id, status } = req.body;
        const orderId = tran_id?.split('-')[0]?.replace('order', '');

        if (status === '0') {
            await pool.query(
                `UPDATE orders SET status = 'paid' WHERE id = $1`,
                [orderId]
            );
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error');
    }
};