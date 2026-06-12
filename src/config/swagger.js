const swaggerJsdoc = require("swagger-jsdoc")

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "DevMart API",
      version: "1.0.0",
      description: `
        Production-grade E-commerce REST API built with Node.js, Express, MongoDB.
        
        ## Features
        - JWT Authentication with refresh tokens
        - Email verification and password reset
        - Product CRUD with Cloudinary image upload
        - Cart, Orders, Reviews system
        - Razorpay payment integration
        - Coupon/discount system
        - Wishlist
        - Admin analytics dashboard
        
        ## Authentication
        Use the /auth/login endpoint to get a token.
        Click Authorize button and enter: Bearer YOUR_TOKEN
      `,
      contact: {
        name: "Vikas Sharma",
        url: "https://github.com/Viks2202"
      }
    },
    servers: [
      {
        url: "https://devmart-api.onrender.com/api/v1",
        description: "Production Server"
      },
      {
        url: "http://localhost:8000/api/v1",
        description: "Development Server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token"
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ["./src/routes/*.js"]
}

module.exports = swaggerJsdoc(options)