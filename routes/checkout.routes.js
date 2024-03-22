
const express = require('express'); 
const router = express.Router(); 
const Order = require('../models/Order.model'); 
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
const app = express();

router.post("/checkout", async (req, res) => {
    const { items, totalCost, guestToken } = req.body;
    let user = req.body.user;

    try {
        const orderData = {
            items,
            totalCost,
        };

        if (user) {
            // If it's an authenticated user's order, add user ID to the order data
            orderData.user = user;
        } else if (guestToken) {
            // If it's a guest's order, add the guest token to the order data
            orderData.guestToken = guestToken;
        } else {
            // If neither a user ID nor a guest token is provided, return an error
            return res.status(400).json({ message: "Order must be placed by an authenticated user or a guest." });
        }

        // Create a new order with the constructed order data
        const newOrder = new Order(orderData);
        const savedOrder = await newOrder.save();

        // Prepare line items for the Stripe checkout session
        let lineItems = items.map(item => ({
            price: item.stripeId,
            quantity: item.quantity
        }));

        // Create a Stripe checkout session with the order ID as metadata
        const session = await stripe.checkout.sessions.create({
            line_items: lineItems,
            mode: 'payment',
            success_url: `https://peak-threads.netlify.app/success?orderId=${savedOrder._id}`,
            cancel_url: "https://peak-threads.netlify.app/cancel",
            metadata: { orderId: savedOrder._id.toString() }
        });

        // Respond with the URL to the Stripe checkout session
        res.json({ url: session.url });
    } catch (error) {
        console.error("Checkout process failed:", error);
        res.status(500).json({ message: "Failed to process checkout" });
    }
});
















// router.post("/checkout", async (req, res) => {
//     console.log("Checkout route triggered!");
//     console.log(req.body);

//     const { items, totalCost, guestToken } = req.body;
//     let user = req.body.user; 

//     try {
//         // Create a new order in the database first
//         const newOrder = new Order({
//             user,
//             items,
//             totalCost,
//         });

//         // Save the order to the database
//         const savedOrder = await newOrder.save();

//         // Prepare line items for Stripe session
//         let lineItems = items.map(item => ({
//             price: item.stripeId,
//             quantity: item.quantity
//         }));

//         // Create Stripe checkout session with order ID as metadata
//         const session = await stripe.checkout.sessions.create({
//             line_items: lineItems,
//             mode: 'payment',
//             success_url: `https://peak-threads.netlify.app/success?orderId=${savedOrder._id}`,
//             cancel_url: "https://peak-threads.netlify.app/cancel",
//             metadata: { orderId: savedOrder._id.toString() }
//         });

//         res.json({ url: session.url });
//     } catch (error) {
//         console.error("Checkout process failed:", error);
//         res.status(500).json({ message: "Failed to process checkout" });
//     }
// });

// router.post("/checkout", async (req, res) => {
//     console.log("Checkout route triggered!"); 

//     console.log(req.body);
//     const items = req.body.items;
//     let lineItems = [];
//     items.forEach((item)=> {
//         lineItems.push(
//             {
//                 price: item.stripeId,
//                 quantity: item.quantity
//             }
//         )
//     });

//     const session = await stripe.checkout.sessions.create({
//         line_items: lineItems,
//         mode: 'payment',
//        // success_url: "https://peak-threads.netlify.app/success",
//        success_url: `https://peak-threads.netlify.app/success?sessionId={CHECKOUT_SESSION_ID}`,

//         cancel_url: "https://peak-threads.netlify.app/cancel"
//     });

//     res.send(JSON.stringify({
//         url: session.url
//     }));
// });


// route for redirecting to the success page
router.get("/redirect-success", (req, res) => {

    res.redirect('https://peak-threads.netlify.app/success');
});


// order route 
router.post('/create', async (req, res) => {
    console.log("Create route triggered!"); 

    try {
        const { user, items, totalCost } = req.body;

        // Create a new order instance
        const newOrder = new Order({
            user,
            items,
            totalCost,
            // orderDate is set by default to now
            // status is set by default to Pending
        });

        // Save the order to the database
        await newOrder.save();

        res.status(201).json({ message: "Order created successfully", order: newOrder });
    } catch (error) {
        console.error("Order creation failed:", error);
        res.status(500).json({ message: "Failed to create order" });
    }
});


module.exports = router
