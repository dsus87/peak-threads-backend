const express = require("express");
const router = express.Router();

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


// How many rounds should bcrypt run the salt (default - 10 rounds)
const saltRounds = 10;

// POST /auth/signup  - Creates a new user in the database
router.post("/signup", (req, res, next) => {
  const { username, email, password, name } = req.body;

  // Check if email or password or name are provided as empty strings
  if (username === "" || email === "" || password === "" || name === "") {
    res.status(400).json({ message: "Provide email, password and name" });
    return;
  }

  // This regular expression check that the email is of a valid format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Provide a valid email address." });
    return;
  }

  // This regular expression checks password for special characters and minimum length
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message:
        "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }

  // Check the users collection if a user with the same email already exists
  User.findOne({ email })
    .then((foundUser) => {
      // If the user with the same email already exists, send an error response
      if (foundUser) {
        res.status(400).json({ message: "User already exists." });
        return;
      }

      // If email is unique, proceed to hash the password
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      // Create the new user in the database
      // We return a pending promise, which allows us to chain another `then`
      return User.create({ username, email, password: hashedPassword, name });
    })
    .then((createdUser) => {
      // Deconstruct the newly created user object to omit the password
      // We should never expose passwords publicly
      const { username, email, name, _id } = createdUser;

      // Create a new object that doesn't expose the password
      const user = { username, email, name, _id };

      // Send a json response containing the user object
      res.status(201).json({ user: user });
    })
    .catch((err) => next(err)); // In this case, we send error handling to the error handling middleware.
});

// POST  /auth/login - Verifies email and password and returns a JWT
router.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  if (email === "" || password === "") {
    res.status(400).json({ message: "Provide email and password." });
    return;
  }

  User.findOne({ email })
    .then((foundUser) => {
      if (!foundUser) {
        res.status(401).json({ message: "User not found." });
        return;
      }

      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

      if (passwordCorrect) {
        const { _id, email, name, isAdmin } = foundUser; // Include isAdmin in the destructuring

        const payload = { _id, email, name, isAdmin }; // Include isAdmin in the JWT payload

        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, 
          { algorithm: "HS256", 
          expiresIn: "6h" 
        });


        // Include isAdmin in the response for the frontend to use
        res.status(200).json({ 
          authToken: authToken, 
          userId: _id, 
          isAdmin // Include isAdmin in the response
      
        });
        

      } else {
        res.status(401).json({ message: "Unable to authenticate the user" });
      }
    })
    .catch((err) => next(err));
});



// PUT :userId Updates the user's profile information. This endpoint requires authentication
router.put('/:userId', upload.single('photo'), isAuthenticated, async (req, res) => {
  const { userId } = req.params; // Correctly access the userId parameter from the route
  const { username, password, email, name } = req.body;

  // Ensure the user is updating their own profile
  if (req.payload._id !== userId) {
    return res.status(403).send("You can only update your own profile.");
  }

  try {
    // Initialize the update object with provided fields
    let updateData = { username, email, name };

    // Handle password update with hashing, if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Include the photo URL from Cloudinary in the update, if a photo was uploaded
    if (req.file && req.file.path) {
      updateData.photo = req.file.path;
    }

    // Update the user in the database
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');

    if (!updatedUser) {
      return res.status(404).send("User not found.");
    }

    // Respond with the updated user details, excluding the password
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while updating the user.");
  }
});




// GET  /auth/verify  -  Used to verify JWT stored on the client
router.get("/verify", isAuthenticated, (req, res, next) => {
  // If JWT token is valid the payload gets decoded by the
  // isAuthenticated middleware and is made available on `req.payload`
  console.log(`req.payload`, req.payload);

  // Send back the token payload object containing the user data
  res.status(200).json(req.payload);
});


// GET Generate a unique guest token

router.get('/generate-guest-token', (req, res) => {
  const guestToken = uuidv4();
  // Send the token back to the client
  res.json({ guestToken });
});


module.exports = router;
