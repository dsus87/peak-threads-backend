
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
    console.log("Checkout route triggered!"); 

    console.log(req.body);
    const items = req.body.items;
    let lineItems = [];
    items.forEach((item)=> {
        lineItems.push(
            {
                price: item.id,
                quantity: item.quantity
            }
        )
    });

    const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: 'payment',
        success_url: "https://peak-threads.netlify.app/success",
        cancel_url: "https://peak-threads.netlify.app/cancel"
    });

    res.send(JSON.stringify({
        url: session.url
    }));
});


module.exports = router
