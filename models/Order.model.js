const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // References the User who placed the order
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    // References the Product being ordered
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    // Quantity of the Product
    price: {
      type: Number,
      required: true,
    },
    // Price at the time of order in case it changes later
  }],
  // An array of item subdocuments, allowing multiple products in one order
  totalCost: {
    type: Number,
    required: true,
  },
  // Total cost of the order
  orderDate: {
    type: Date,
    default: Date.now,
  },
  // The date when the order was placed
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Shipped', 'Cancelled'],
    default: 'Pending',
  },
  // The status of the order
});

module.exports = model("Order", orderSchema);
