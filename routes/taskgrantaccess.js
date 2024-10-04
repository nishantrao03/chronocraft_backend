const express = require('express');
const router = express.Router();
const tasksDetails = require('../models/taskDetails'); // Import the TaskDetails model
const UserDetails = require('../models/userDetails');
const authenticate = require('../authenticate');

// Grant access to a task
router.put('/tasks/:taskId/grant-access', authenticate, async (req, res) => {
    //console.log("Debug grant");
    const { taskId } = req.params;
    const { adminUserId, targetUserId } = req.body;

    try {
        // Find the task by ID
        const task = await tasksDetails.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if the granting user is an admin
        const isAdmin = task.admins.includes(adminUserId);
        if (!isAdmin) {
            return res.status(403).json({ message: 'Only admins can grant access to the task' });
        }

        // Check if the target user has requested access
        const hasRequestedAccess = task.requests.some(request => request.userID === targetUserId);
        if (!hasRequestedAccess) {
            return res.status(400).json({ message: 'User has not requested access' });
        }

        // Check if the user is already in the users array (to avoid adding again)
        const isAlreadyMember = task.users.includes(targetUserId);
        if (isAlreadyMember) {
            return res.status(400).json({ message: 'User is already a member of the task' });
        }

        // Add the user to the users array
        task.users.push(targetUserId);

        // Remove the user from the requests array
        task.requests = task.requests.filter(request => request.userID !== targetUserId);

        // Save the updated task
        await task.save();

        // Add the taskId to the target user's tasks field
        const user = await UserDetails.findOne({ userID: targetUserId });
        if (!user) {
            return res.status(404).json({ message: 'Target user not found' });
        }

        user.tasks.push(taskId);
        await user.save();

        // Return a success response
        return res.status(200).json({ message: 'Access granted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;
