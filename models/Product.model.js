const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Product has a Many-to-One relationship with User (as a seller).
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Unisex'],
    default: 'Unisex',
    required: true,
  },
  category: {
    type: String,
    enum: ['Shoes', 'T-shirt', 'Outerwear'],
    default: 'Outerwear',
    required: true,
  },
  quantity: {
    S: { type: Number, default: 0 },
    M: { type: Number, default: 0 },
    L: { type: Number, default: 0 },
  },
  photo: String,
  brand: {
    type: String,
    required: true,
  },
});

module.exports = model("Product", productSchema);
