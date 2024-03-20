
const express = require('express'); 
const router = express.Router(); 
const Order = require('../models/Order.model'); 

const express = require("express");

const { v4: uuidv4 } = require('uuid');

// ℹ️ Handles password encryption
const bcrypt = require("bcrypt");

const upload = require('../middleware/cloudinary.middleware');

// ℹ️ Handles password encryption
const jwt = require("jsonwebtoken");

// Require the User model in order to interact with the database
const User = require("../models/User.model.js")
const Product = require("../models/Product.model.js")
//const Cart = require("../models/Cart.model.js")

const { isAuthenticated, isAdmin, isGuest, allowAuthenticatedOrGuest } = require("../middleware/jwt.middleware.js");


const stripe = require('stripe')(process.env.STRIPE_SECRET); 



router.post("/checkout",allowAuthenticatedOrGuest, async (req, res) => {
    console.log(process.env.STRIPE_SECRET)
    console.log(req.body);
    
    const items = req.body.items;
    let lineItems = [];
    items.forEach((item)=> {
        lineItems.push(
            {
                price: item.stripeId,
                quantity: item.quantity
            }
        )
    });

    const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: 'payment',
        success_url: "https://peak-threads.netlify.app/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "https://peak-threads.netlify.app/cancel"
    });


     // Order creation (after successful payment)
     const userId = req.payload ? req.payload._id : null; // Get userId from JWT payload
     const newOrder = new Order({
        buyerId: userId, 
        stripeSessionId: session.id, 
        orderDate: Date.now(), // You can keep the default if you don't need to override 
    
        // Assuming you have these details in req.body
        products: req.body.items.map(item => ({
            name: item.name, // Snapshot of product name
            quantity: item.quantity,
            size: item.size,
            priceAtPurchase: item.price,  // Or calculate if needed
        })),
        totalPrice: req.body.totalPrice,
        paymentDetails: {
           method: req.body.paymentMethod,
           status: 'Paid', // Assuming successful payment
        },
    
        // Start with 'New', you might update this later
        status: 'New', 
    });

     try {
        await newOrder.save();
        res.send(JSON.stringify({ url: session.url }));
    } catch (error) {
        console.error("Error saving order: ", error);
        // Handle error gracefully (e.g., redirect to an error page)
    }
});



module.exports = router;
