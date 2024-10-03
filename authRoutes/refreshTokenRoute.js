// routes/refreshTokenRoute.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { generateAccessToken } = require('../jwt/jwtUtils');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET; // Store secret in .env

router.post('/refresh-token', (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

  jwt.verify(refreshToken, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid refresh token' });

    const newAccessToken = generateAccessToken(user.id);
    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
      maxAge: 3600 * 1000, // 1 hour
    });

    return res.status(200).json({ message: 'Access token refreshed' });
  });
});

module.exports = router;
