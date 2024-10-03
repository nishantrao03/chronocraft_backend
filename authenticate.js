const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;


const authenticate = (req, res, next) => {
  // Get token from HTTP-only cookies
  const token = req.cookies.access_token;
  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
        console.log(err.message);
      return res.status(403).json({ message: 'Invalid token' });
    }

    // Attach the user data to request object
    req.user = user;

    // Call next middleware or route handler
    next();
  });
};

module.exports = authenticate;
