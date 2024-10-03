// routes/tasks.js

const express = require('express');
//const mongoose = require('mongoose');
const router = express.Router();
const UserDetails = require('../models/userDetails'); // Import the UserDetails model
const TaskDetails = require('../models/taskDetails');
const authenticate = require('../authenticate');

// Delete a task by task ID
router.delete('/api/tasks/:taskID', authenticate, async (req, res) => {
    try {
      const { taskID } = req.params;
  
      // Validate taskID
      if (!taskID) {
        return res.status(400).json({ error: 'Invalid taskID' });
      }
  
      // Delete the task from tasksDetails collection
      await TaskDetails.findOneAndDelete({ _id: taskID });
  
      // Remove the task ID from user's tasks in userDetails collection
      await UserDetails.updateMany({}, { $pull: { tasks: taskID } });
  
      res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

module.exports = router;
