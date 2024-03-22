const express = require('express');
const router = express.Router();
const Order = require('../models/Order.model'); 
const { isAuthenticated, isGuest, isAdmin, allowAuthenticatedOrGuest } = require("../middleware/jwt.middleware.js");
const { updateProductQuantities } = require('../middleware/Order.middleware.js'); 



// // POST /order - Create a new order
// router.post('/', isAuthenticated,  async (req, res, next) => {
//     console.log("Request Body:", req.body);
//     const { products, shippingDetails, totalPrice, paymentDetails, orderStatus } = req.body;
//     const buyerId = req.payload._id; 

//     try {
//         // Create the order
//         const newOrder = await Order.create({
//             buyerId,
//             products,
//             shippingDetails,
//             totalPrice,
//             paymentDetails,
//             orderStatus: 'Pending', 
//         });

//         await updateProductQuantities(products);

//         res.status(201).json(newOrder);
//     } catch (error) {
//         console.error('Failed to create order:', error);
//         next(error);
//     }
// });

// 

// ALL orders for admin

router.get('/all-orders', isAuthenticated, isAdmin, async (req, res, next) => {
    try {
        const orders = await Order
        .find({})
        .populate('items.product');
        res.status(200).json(orders);
    } catch (error) {
        console.error('Failed to retrieve orders:', error);
        res.status(500).json({ message: 'Failed to retrieve orders.' });
    }
});

module.exports = router;



// // GET orders/all-orders - Get all orders for the logged-in user
// router.get('/all-orders', isAuthenticated, async (req, res, next) => {
//     const userId = req.payload._id;

//     try {
//         const orders = await Order.find({ buyerId: userId });
//         res.status(200).json(orders);
//     } catch (error) {
//         next(error);
//     }
// });

// GET /api/orders/:orderId - Get details of a specific order
router.get('/:orderId', isAuthenticated, async (req, res, next) => {
    const { orderId } = req.params;
    const userId = req.payload._id;

    try {
        const order = await Order.findOne({ _id: orderId, buyerId: userId });
        if (!order) {
            return res.status(404).json({ message: "Order not found or you do not have permission to view it." });
        }
        res.status(200).json(order);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
