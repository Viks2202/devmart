# DevMart — E-commerce REST API

A production-grade e-commerce backend built with Node.js, Express, and MongoDB.

## Live API
https://devmart-api.onrender.com

## Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary (image upload)
- Nodemailer + Mailtrap
- Bcrypt

## Features
- User auth (register, login, JWT, refresh tokens)
- Email verification + password reset
- Product CRUD with image upload
- Advanced search, filters, pagination
- Cart management
- Order placement and tracking
- Product reviews and ratings
- Admin dashboard with analytics
- Role-based access control

## API Endpoints

### Auth
- POST /auth/register
- POST /auth/login
- GET  /auth/me
- POST /auth/forgot-password
- POST /auth/reset-password/:token

### Products
- GET    /products
- GET    /products/:id
- POST   /products (admin)
- PUT    /products/:id (admin)
- DELETE /products/:id (admin)

### Cart
- GET    /cart
- POST   /cart/add
- PUT    /cart/update
- DELETE /cart/item/:productId

### Orders
- POST /orders
- GET  /orders/my
- GET  /orders/:id
- PUT  /orders/:id/cancel

### Admin
- GET /admin/stats
- GET /admin/users
- GET /admin/orders

## Setup Locally
```bash
git clone https://github.com/Viks2202/devmart
cd devmart
npm install
# Add .env file with your credentials
npm run dev
```

## Environment Variables
```
MONGO_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
MAILTRAP_USER=
MAILTRAP_PASS=
```