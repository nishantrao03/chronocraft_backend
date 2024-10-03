const express = require('express');
const UserDetails = require('../models/userDetails'); // Import the UserDetails model
const authenticate = require('../authenticate');

const router = express.Router();

router.post('/api/auth', authenticate, async (req, res) => {
  const { userID } = req.body;
  console.log("Debug 1");
  try {
    // Check if the user already exists in userDetails collection
    const existingUser = await UserDetails.findOne({ userID });
    console.log("Debug 2");
    if (!existingUser) {
      // Create a new user details entry in userDetails collection if the user does not exist
      const newUserDetails = new UserDetails({ userID });
      await newUserDetails.save();
    }
    console.log("Debug 3");
    // Send a success response regardless of whether the user was newly created or already existed
    res.status(200).json({ message: 'User is processed successfully' });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error('Error processing user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
