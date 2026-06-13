# DevMart — Production E-commerce REST API

A production-grade e-commerce backend built with Node.js, Express, and MongoDB.

## 🚀 Live
| | URL |
|--|--|
| **API** | https://devmart-api.onrender.com |
| **Docs** | https://devmart-api.onrender.com/api-docs |
| **Health** | https://devmart-api.onrender.com/health |
| **GitHub** | https://github.com/Viks2202/devmart |

> Free tier sleeps after 15 min inactivity. First request may take 30-60 sec.

## 🛠 Tech Stack
| Category | Technology |
|----------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcrypt + Refresh Tokens |
| File Storage | Cloudinary |
| Email | Nodemailer + Mailtrap |
| Payment | Razorpay |
| Security | Helmet + CORS + Rate Limiting + XSS + NoSQL Injection |
| Logging | Winston |
| Documentation | Swagger/OpenAPI |
| Deployment | Render |

## ✅ Features
- **Authentication** — Register, Login, JWT access/refresh tokens, Email verification, Password reset
- **Products** — CRUD with image upload, Search, Filter by category/price, Pagination, Sort
- **Cart** — Add/remove/update items, Auto price calculation
- **Orders** — Place, track, cancel orders with status history
- **Reviews** — Add reviews with auto product rating updates
- **Wishlist** — Save/remove products
- **Coupons** — Percentage and fixed discounts with usage limits
- **Payments** — Razorpay integration with signature verification
- **Admin** — Dashboard analytics, user management, order management
- **Security** — Rate limiting, Helmet headers, XSS protection, NoSQL injection prevention

## 📋 API Endpoints

### Base URL: `/api/v1`

### Auth `/api/v1/auth`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /register | Register user | No |
| POST | /login | Login | No |
| GET | /me | Get profile | Yes |
| PUT | /profile | Update profile | Yes |
| PUT | /change-password | Change password | Yes |
| POST | /forgot-password | Send reset email | No |
| POST | /reset-password/:token | Reset password | No |
| GET | /verify-email/:token | Verify email | No |
| POST | /logout | Logout | Yes |

### Products `/api/v1/products`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | / | Get all with filters | No |
| GET | /:id | Get single product | No |
| POST | / | Create product | Admin |
| PUT | /:id | Update product | Admin |
| DELETE | /:id | Delete product | Admin |
| POST | /:id/images | Upload images | Admin |

### Cart `/api/v1/cart`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | / | Get my cart | Yes |
| POST | /add | Add to cart | Yes |
| PUT | /update | Update quantity | Yes |
| DELETE | /item/:productId | Remove item | Yes |
| DELETE | /clear | Clear cart | Yes |

### Orders `/api/v1/orders`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | / | Place order (supports coupon) | Yes |
| GET | /my | My orders | Yes |
| GET | /all | All orders | Admin |
| GET | /:id | Single order | Yes |
| PUT | /:id/status | Update status | Admin |
| PUT | /:id/cancel | Cancel order | Yes |

### Reviews `/api/v1/reviews`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /:productId | Add review | Yes |
| GET | /:productId | Get reviews | No |
| DELETE | /:reviewId | Delete review | Yes |

### Wishlist `/api/v1/wishlist`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | / | Get my wishlist | Yes |
| POST | /add | Add to wishlist | Yes |
| GET | /check/:productId | Check if wishlisted | Yes |
| DELETE | /item/:productId | Remove from wishlist | Yes |
| DELETE | /clear | Clear wishlist | Yes |

### Coupons `/api/v1/coupons`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /apply | Validate coupon | Yes |
| GET | / | All coupons | Admin |
| POST | / | Create coupon | Admin |
| PUT | /:id | Update coupon | Admin |
| DELETE | /:id | Delete coupon | Admin |

### Payment `/api/v1/payment`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /create | Create Razorpay order | Yes |
| POST | /verify | Verify payment | Yes |
| GET | /status/:orderId | Payment status | Yes |

### Admin `/api/v1/admin`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /stats | Dashboard stats | Admin |
| GET | /users | All users | Admin |
| GET | /products | All products | Admin |
| GET | /orders | All orders | Admin |

## 🔍 Query Parameters (GET /api/v1/products)