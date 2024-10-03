const express = require('express');
const UserDetails = require('../models/userDetails'); // Import the UserDetails model
const TaskDetails = require('../models/taskDetails');
const authenticate = require('../authenticate');

const router = express.Router();

// Get user tasks
router.get('/api/tasks/:userID', authenticate, async (req, res) => {
    try {
      const userID = req.params.userID;
      //console.log(userID);
      
      // Find user details to get task IDs associated with the given userID
      const userDetails = await UserDetails.findOne({ userID });
      //console.log(userDetails);
      if (!userDetails) {
        return res.status(404).json({ error: 'User not found' });
      }
      
  
      // Fetch task details for each task ID associated with the user
      const tasks = await Promise.all(userDetails.tasks.map(async taskID => {
        
        const task = await TaskDetails.findById(taskID);
        return task;
      }));
  
      res.status(200).json(tasks);
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

module.exports = router;