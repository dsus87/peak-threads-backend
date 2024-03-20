const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const orderSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Make it optional to accommodate orders by guests
  },
  guestId: { // Optional identifier for guest users
    type: String,
    required: false, // This or buyerId should be provided
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },

  stripeSessionId: {
    type: String,
    required: true 
},
  
  shippingDetails: {
    name: String,
    address: String,
    city: String,
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    size: {
      type: String,
      enum: ['S', 'M', 'L'],
      required: true, // Consider making this required if all products have sizes
    },
    priceAtPurchase: {
      type: Number,
      required: true, // Capture the price of the product at the time of purchase
    }
  }],
  totalPrice: {
    type: Number,
    required: true,
  },
  paymentDetails: {
    method: { type: String, required: true },
    status: { type: String, enum: ['Paid', 'Pending', 'Failed'], required: true },
    transactionId: { type: String, required: false },
  },
  // Consider adding status to track the overall order status
  status: {
    type: String,
    enum: ['New', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'New',
    required: true,
  },
});

module.exports = model("Order", orderSchema);
