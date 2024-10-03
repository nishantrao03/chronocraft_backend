const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const UserDetails = require('../models/userDetails'); // Import the UserDetails model
const TaskDetails = require('../models/taskDetails');
const authenticate = require('../authenticate');

router.put('/api/tasks/:taskId', authenticate, async (req, res) => {
    try {
      const { taskId } = req.params;
      const updatedTask = req.body;
  
      // Find and update the task by ID
      const task = await TaskDetails.findByIdAndUpdate(taskId, updatedTask, { new: true });
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
  
      res.status(200).json({ message: 'Task updated successfully', task });
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

module.exports = router;
