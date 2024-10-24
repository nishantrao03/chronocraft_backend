const express = require('express');

const router = express.Router();

router.get('/healthcheck', (req, res) => {
    res.status(200).send('Backend is active');
  });

module.exports = router;