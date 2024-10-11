const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const UserDetails = require('../models/userDetails'); // Import the UserDetails model
const TaskDetails = require('../models/taskDetails');
const authenticate = require('../authenticate');

router.put('/api/tasks/:taskId', authenticate, async (req, res) => {
    try {
      const { taskId } = req.params;
        const { updatedTask, userId } = req.body;

        // Fetch the task corresponding to taskId
        const task = await TaskDetails.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Check if userId is present in the admins field of the task
        if (!task.admins.includes(userId)) {
            return res.status(403).json({ error: 'User not authorized to update this task' });
        }

        // Find and update the task by ID
        const updatedTaskDetails = await TaskDetails.findByIdAndUpdate(taskId, updatedTask, { new: true });
        
        res.status(200).json({ message: 'Task updated successfully', task: updatedTaskDetails });
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

module.exports = router;
