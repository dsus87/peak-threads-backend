const express = require("express");
const router = express.Router();


const User = require("../models/User.model.js")
const Product = require("../models/Product.model.js")

// GET / - Retrieves all products and their information
router.get("/", async (req, res, next) => {
  try {
    const products = await Product.find({}); 
    res.json(products); 
  } catch (err) {
    console.error("Error retrieving products", err);
    res.status(500).json({ message: "Error retrieving products" });
  }
});



// GET /shop/:userId - Gets the profile information and their product list
router.get("/shop/:userId", async (req, res, next) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Corrected to use sellerId for matching products to the user
    const products = await Product.find({ sellerId: userId });

    const response = {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
      },
      products: products,
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("Error retrieving user profile and products", err);
    res.status(500).json({ message: "Error retrieving user profile and products" });
  }
});




module.exports = router;
