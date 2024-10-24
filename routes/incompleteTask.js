const express = require('express');
const TaskDetails = require('../models/taskDetails');
const authenticate = require('../authenticate');
const markIncomplete = require('../taskUtils/markIncomplete');

const router = express.Router();

router.post('/api/tasks/:id/incomplete', authenticate, async (req, res) => {
    const { userId } = req.body;
    const taskId = req.params.id;
    
    const result = await markIncomplete(taskId, userId);
    res.status(result.status).json({ message: result.message });
});

module.exports = router;
