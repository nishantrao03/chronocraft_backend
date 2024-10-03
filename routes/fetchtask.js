const express = require('express');
const router = express.Router();
const taskDetails = require('../models/taskDetails'); // Adjust path as per your project structure
const authenticate = require('../authenticate');

// GET endpoint to fetch a task by ID
router.get('/tasks/:taskId', authenticate, async (req, res) => {
  try {
    const taskId = req.params.taskId;

    // Fetch the task from the database by ID
    const task = await taskDetails.findById(taskId); // Optionally populate subTasks if needed

    // Check if the task exists
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Sort updates by updatedAt (most recent first)
    task.updates.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    // If task is found, return it
    res.status(200).json(task);
  } catch (error) {
    console.error("Error fetching task:", error);

    // Handle error (e.g., invalid ID format, database error)
    res.status(500).json({ message: "An error occurred while fetching the task" });
  }
});

module.exports = router;
