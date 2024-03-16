const express = require('express');
const router = express.Router();

const Product = require('../models/Product.model');


const upload = require('../middleware/cloudinary.middleware');

const { isAuthenticated, isAdmin, isGuest, allowAuthenticatedOrGuest } = require("../middleware/jwt.middleware.js");


// POST /products/userId/register-product - Allows a registered user to list a new product for sale. Requires seller authentication.

router.post('/register-products', isAuthenticated, isAdmin, upload.single('photo'), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const sellerId = req.payload._id;

    const { name, description, price, gender, category, brand, 'quantity[S]': quantityS, 'quantity[M]': quantityM, 'quantity[L]': quantityL } = req.body;

    const photo = req.file ? req.file.path : null;

    const savedProduct = await Product.create({
      name,
      description,
      price,
      gender,
      category,
      quantity: {
        S: quantityS || 0, // Use || 0 to provide a default value of 0 if not specified
        M: quantityM || 0,
        L: quantityL || 0,
      },
      photo,
      brand,
      sellerId,
    });

    res.status(201).json(savedProduct);
  } catch (error) {
    next(error);
  }
});

// GET /products/products - Retrieves all of the products
router.get("/products", (req, res, next) => {
    Product.find()
      // .populate('sellerId') 
      .then((allProducts) => res.json(allProducts))
      .catch((err) => {
        console.error("Error while getting the products", err);
        res.status(500).json({ message: "Error while getting the products" });
      });
  });


// GET /products/:productId - Get details of a specific product
router.get('/:productId', async (req, res, next) => {
  
  const { productId } = req.params;
  console.log(req.params)


  try {
      const product = await Product
      .findById(productId)
      .populate('sellerId');
      if (!product) {
          return res.status(404).json({ message: "Product not found." });
      }
      res.status(200).json(product);
  } catch (error) {
      next(error);
  }
});

// PUT /products/update-products/:productId - Updates information for an existing product

router.put('/update-products/:productId', isAuthenticated,  upload.single('photo'),async (req, res, next) => {
  const { productId } = req.params;
  const userId = req.user._id; // Assuming `req.user._id` is set by isAuthenticated middleware and contains the ID of the current user
  const { name, description, price, gender, category, quantity, photo, brand } = req.body;

  try {
      // First, find the product to ensure it exists and is owned by the current user
      const product = await Product.findOne({ _id: productId, sellerId: userId });
      if (!product) {
          // If the product doesn't exist or isn't owned by the user, return an error
          return res.status(404).json({ message: "Product not found or you're not authorized to update it." });
      }

      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.gender = gender || product.gender;
      product.category = category || product.category;
      product.quantity = quantity || product.quantity;
      product.photo = photo || product.photo;
      product.brand = brand || product.brand;

      // Save the updated product
      await product.save();

      res.status(200).json(product);
  } catch (error) {
      next(error);
  }
});


// DELETE /products/delete-products/- Deletes an existing product

router.delete('/delete-products/:productId', isAuthenticated, isAdmin, async (req, res, next) => {
  try {
    const { productId } = req.params; 
    const { userId, isAdmin } = req.params;
    const sellerId = req.payload._id;

    
    // Find and delete the product
    const deletedProduct = await Product.findByIdAndDelete(productId);

    // Handle if the product doesn't exist
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product successfully deleted." });
  } catch (error) {
    next(error); // Pass the error to your error-handling middleware
  }
});






module.exports = router;



