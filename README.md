# Zabuy Backend API

Base URL (local): `http://localhost:5000`

All protected routes need a header: `Authorization: Bearer <token>`
Get a token from `/api/users/login`.

## Auth

### Register
POST /api/users/register
Body: { "name": "string", "email": "string", "password": "string" }
Returns: { message, user: { id, name, email } }

### Login
POST /api/users/login
Body: { "email": "string", "password": "string" }
Returns: { message, token, user: { id, name, email } }

### Get profile (protected)
GET /api/users/profile
Returns: { user: { id } }

## Products

### List all products
GET /api/products
Returns: [ { id, name, description, price, stock, image_url, created_at } ]

### Get one product
GET /api/products/:id
Returns: { id, name, description, price, stock, image_url, created_at }

### Create product (protected)
POST /api/products
Body: { "name", "description", "price", "stock", "image_url" }
Returns: { message, product }

### Update product (protected)
PUT /api/products/:id
Body: { "name", "description", "price", "stock", "image_url" }
Returns: { message, product }

### Delete product (protected)
DELETE /api/products/:id
Returns: { message }

## Cart (all protected)

### Add to cart
POST /api/cart
Body: { "productId": number, "quantity": number }
Returns: { message, item }

### View cart
GET /api/cart
Returns: [ { id, quantity, product_id, name, price, image_url } ]

### Update quantity
PUT /api/cart/:productId
Body: { "quantity": number }
Returns: { message, item }

### Remove item
DELETE /api/cart/:productId
Returns: { message }

## Orders (protected)

### Checkout (turns cart into an order)
POST /api/orders/checkout
Returns: { message, order: { id, user_id, total_price, status, created_at } }

## Payments (protected)

### Generate Bakong KHQR
POST /api/payments/:orderId/qr
Returns: { qr, md5 }

### Confirm payment (mock, stands in for a real webhook)
POST /api/payments/:orderId/confirm
Returns: { message, order }

### Generate ABA PayWay QR
POST /api/payments/:orderId/aba-qr
Returns: { qrString, qrImage, abapay_deeplink, amount, currency, status }

### ABA webhook (not protected — called by ABA's servers)
POST /api/payments/aba-callback
Body: sent by ABA automatically after payment