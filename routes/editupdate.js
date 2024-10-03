const express = require('express');
const router = express.Router();
const UserDetails = require('../models/userDetails');
const TaskDetails = require('../models/taskDetails'); // Adjust path as per your project structure
const authenticate = require('../authenticate');

router.put('/tasks/:taskId/updates/:updateId', authenticate, async (req, res) => {
    const { taskId, updateId } = req.params;
    const { userID, newUpdate } = req.body;

    try {
        const task = await TaskDetails.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if the user is an admin
        if (!task.admins.includes(userID)) {
            return res.status(403).json({ message: 'Only admins can edit updates' });
        }

        // Find the specific update
        const update = task.updates.id(updateId);

        if (!update) {
            return res.status(404).json({ message: 'Update not found' });
        }

        // Update the content and timestamp
        update.update = newUpdate;
        update.updatedAt = new Date();

        await task.save();
        return res.status(200).json({ message: 'Update edited successfully', updates: task.updates });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error });
    }
});

module.exports=router;