// Import necessary modules
const express = require('express');
const router = express.Router();
const TasksDetails = require('../models/taskDetails'); // Assuming your models are in a 'models' folder
const UserDetails = require('../models/userDetails'); // Assuming you want to validate user existence
const authenticate = require('../authenticate');

// Route: POST /tasks/:taskId/request-access
router.post('/api/tasks/:taskId/request-access', authenticate, async (req, res) => {
  const { taskId } = req.params;
  const { userID } = req.body;

  try {
    // Step 1: Validate that the user exists
    const user = await UserDetails.findOne({ userID });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Step 2: Find the task by ID
    const task = await TasksDetails.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Step 3: Check if the user has already requested access
    const hasAlreadyRequested = task.requests.some(request => request.userID === userID);
    if (hasAlreadyRequested) {
      return res.status(400).json({ message: 'User has already requested access to this task' });
    }

    // Step 4: Add the userID to the requests array
    task.requests.push({ userID });

    // Step 5: Save the updated task
    await task.save();

    // Step 6: Return success message
    return res.status(200).json({ message: 'Access request sent successfully' });
  } catch (error) {
    console.error('Error requesting task access:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
