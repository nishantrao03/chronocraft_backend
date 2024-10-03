const express = require('express');
const router = express.Router();
const UserDetails = require('../models/userDetails');
const TaskDetails = require('../models/taskDetails'); // Adjust path as per your project structure
const authenticate = require('../authenticate');


router.post('/tasks/:taskId/updates', authenticate, async (req, res) => {
    const { taskId } = req.params;
    const { userID, update } = req.body;

    try {
        const task = await TaskDetails.findById(taskId);
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (!task.admins.includes(userID)) {
            return res.status(403).json({ message: 'Only admins can add updates' });
        }

        const newUpdate = { userID, update, createdAt: new Date(), updatedAt: new Date() };

        task.updates.push(newUpdate);

        await task.save();

        return res.status(200).json({ message: 'Update added successfully', updates: task.updates });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;