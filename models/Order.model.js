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
    },
    quantity: {
      type: Number,
    },
    size: {
      type: String,
      enum: ['S', 'M', 'L'],
    },
    priceAtPurchase: {
      type: Number,
    }
  }],
  totalPrice: {
    type: Number,
  },
  paymentDetails: {
    method: { type: String },
    status: { type: String, enum: ['Paid', 'Pending', 'Failed']},
    transactionId: { type: String, required: false },
  },
  // Consider adding status to track the overall order status
  status: {
    type: String,
    enum: ['New', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'New',

  },
});

module.exports = model("Order", orderSchema);
