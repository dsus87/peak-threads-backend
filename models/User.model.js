const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  photo: String,
  
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
});

module.exports = model("User", userSchema);
