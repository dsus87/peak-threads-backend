# Full-Stack E-Commerce Platform

## Overview

This project presents a comprehensive e-commerce solution with both client-side and server-side operations, enabling a seamless shopping experience. The back-end is constructed with Node.js and Express, leveraging MongoDB for data storage, Cloudinary for image storage, and Stripe for secure payment processing. The front-end is developed using React, employing Context API for global state management and React Router for navigation.

## Architecture

### Back-End

- **Cloudinary Middleware**: Integrates with Cloudinary's API for efficient image upload and management, directly linking product images in the database with their respective Cloudinary URLs.
- **JWT Middleware**: Secures API endpoints through JWT-based authentication, ensuring that certain actions are restricted to authenticated users or admin roles.
- **Stripe Middleware**: Facilitates payment processing, encapsulating the logic needed to handle transactions, from cart checkout to payment confirmation.
- **Routes**: Organized around core functionalities such as user authentication (auth.routes.js), product lifecycle management (product.routes.js), and order processing (Order.routes.js, checkout.routes.js), these routes form the API's backbone, enabling dynamic data interaction and business logic execution.

### Front-End

- **Contexts**:  AuthContext.jsx and CartContext.jsx provide global state management for user authentication and shopping cart contents, allowing for a consistent and secure user experience across the application.
- **Components**: Components like Account.jsx, OrderHistory.jsx, and ProductDetail.jsx offer users interactive and informative interfaces for account management, order review, and product exploration, dynamically rendering data retrieved through the API.
- **Seller Tools**: EditProductPage.jsx and RegisterProduct.jsx empower sellers with the capability to manage their product listings directly from the front-end, interfacing with the back-end for data persistence.
- **Checkout Process**: Leveraging Checkout.jsx and Success.jsx, the application provides a smooth checkout process, integrating Stripe for payments and offering immediate feedback on transaction outcomes.