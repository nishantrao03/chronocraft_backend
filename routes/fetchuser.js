// Import required modules
const express = require('express');
const UserDetails = require('../models/userDetails'); // Path to your UserDetails model
const authenticate = require('../authenticate');

// Create a router
const router = express.Router();

// Define the endpoint to fetch user details by userID
router.get('/api/user/:userID', authenticate, async (req, res) => {
  try {
    // Extract userID from the request parameters
    const userID = req.params.userID;

    // Fetch user details from the database using the provided userID
    const userDetails = await UserDetails.findOne({ userID });

    // Check if the user was found
    if (!userDetails) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send back the user details in the response
    res.status(200).json(userDetails);
  } catch (error) {
    // Handle errors
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
