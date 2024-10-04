// routes/loginRoute.js
const express = require('express');
const admin = require('../firebase-admin'); // Adjust path as necessary
const { generateAccessToken, generateRefreshToken } = require('../jwt/jwtUtils');
require('dotenv').config();

const router = express.Router();

router.post('/login', async (req, res) => {
  const { firebaseToken } = req.body;
  //console.log(firebaseToken);

  try {
    // // Step 1: Verify Firebase Token
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    const userId = decodedToken.uid;
    //console.log("Decoded Token:", decodedToken);

    // Step 2: Generate JWTs for session management
    const accessToken = generateAccessToken(userId);
    //console.log(accessToken);
    const refreshToken = generateRefreshToken(userId);
    //console.log(accessToken,refreshToken);

    // Step 3: Set HTTP-only cookies for access and refresh tokens
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // secure in production
      sameSite: 'None',
      maxAge: 3600 * 1000, // 1 hour
    });
    
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // secure in production
      sameSite: 'None',
      maxAge: 7 * 24 * 3600 * 1000, // 7 days
    });

    // Step 4: Send success response
    return res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    return res.status(401).json({ message: 'Invalid Firebase token' });
  }
});

module.exports = router;
