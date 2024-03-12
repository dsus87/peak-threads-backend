const { expressjwt: jwt } = require("express-jwt");

// Instantiate the JWT token validation middleware
const isAuthenticated = jwt({
  secret: process.env.TOKEN_SECRET,
  algorithms: ["HS256"],
  requestProperty: "payload",
  getToken: getTokenFromHeaders,
});

// Function used to extract the JWT token from the request's 'Authorization' Headers
function getTokenFromHeaders(req) {
  // Check if the token is available on the request Headers
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    // Get the encoded token string and return it
    const token = req.headers.authorization.split(" ")[1];
    return token;
  }

  return null;
}

// isAdmin middleware
const isAdmin = (req, res, next) => {
  console.log(req.payload); 
  if (req.payload && req.payload.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin rights required." });
  }
};


// Middleware to check for a guest token
function isGuest(req, res, next) {
  const guestToken = req.headers['x-guest-token'];
  if (guestToken && guestToken === process.env.GUEST_TOKEN) {
    req.isGuest = true;
    next();
  } else {
    next(); // Proceed without marking as guest, allowing isAuthenticated to run if applicable
  }
}

// Combined middleware to allow authenticated users or guests
function allowAuthenticatedOrGuest(req, res, next) {
  // First, attempt to authenticate as a user
  isAuthenticated(req, res, (err) => {
    if (!err) {
      // If isAuthenticated succeeds, proceed
      req.isGuest = false; // Ensure isGuest flag is explicitly set
      return next();
    }
    // If JWT authentication fails, try guest token check
    isGuest(req, res, (guestErr) => {
      if (req.isGuest) {
        // If guest token is valid, proceed
        return next();
      }
      // If neither JWT nor guest token is valid, restrict access
      return res.status(401).json({ message: "Unauthorized access" });
    });
  });
}

module.exports = { isAuthenticated, isAdmin, isGuest, allowAuthenticatedOrGuest };
