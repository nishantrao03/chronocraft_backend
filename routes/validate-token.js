const express = require('express');
const router = express.Router();
const authenticate = require('../authenticate');

// Define a route to check the authorization of the token
router.get('/api/validate-token', authenticate, (req, res) => {
    // If the token is valid, this endpoint will be reached
    res.status(200).json({ message: 'Token is valid' });
});

module.exports = router;
