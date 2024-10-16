const express = require('express');
const router = express.Router();
const tasksDetails = require('../models/taskDetails'); // Import the TaskDetails model
const authenticate = require('../authenticate');

// Deny access to a task
router.put('/tasks/:taskId/deny-access', authenticate, async (req, res) => {
    const { taskId } = req.params;
    const { adminUserId, targetUserId } = req.body;

    try {
        // Find the task by ID
        const task = await tasksDetails.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if the denying user is an admin
        const isAdmin = task.admins.includes(adminUserId);
        if (!isAdmin) {
            return res.status(403).json({ message: 'Only admins can deny access to the task' });
        }

        // Check if the target user has requested access
        const hasRequestedAccess = task.requests.some(request => request.userID === targetUserId);
        if (!hasRequestedAccess) {
            return res.status(400).json({ message: 'User has not requested access' });
        }

        // Remove the user from the requests array (deny the access request)
        task.requests = task.requests.filter(request => request.userID !== targetUserId);

        // Save the updated task
        await task.save();

        // Return a success response
        return res.status(200).json({ message: 'Access request denied successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;
