const express = require('express');
const router = express.Router();
const taskDetails = require('../models/taskDetails'); // Adjust path as per your project structure
const authenticate = require('../authenticate');
const generateAIResponse = require('../google_gen_ai/text_generation');

// GET endpoint to fetch a task by ID
router.get('/tasks/:taskId', authenticate, async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const userId = req.query.userId; // Assuming user ID is available in req.user after authentication
    // Fetch the task from the database by ID
    const task = await taskDetails.findById(taskId); // Optionally populate subTasks if needed

    // Check if the task exists
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if the user is in the task's users array
    if (!task.users.includes(userId)) {
      if (!task.users.includes(userId)) {
        // Check if the user has already requested access
        const userHasRequested = task.requests.some(request => request.userID === userId);
  
        // Return 403 with additional info if the user has requested access
        return res.status(403).json({ 
          message: "Access denied: You do not have permission to view this task.", 
          hasRequestedAccess: userHasRequested 
        });
      }
    }

    // Check if ATD is null or empty, regenerate it if necessary
    if ((!task.ancestorTaskDescription || task.ancestorTaskDescription.trim() === '')&&task.parentTaskId) {


      // Generate the ATD prompt
      const prompt = `Given the following context, generate a concise description (maximum 100 words) that summarizes the task in relation to its ancestor tasks. This description will serve as the task's 'Ancestor Task Description' (ATD) for reference purposes.
      
      Current Task Description: ${task.description}. 
      Parent Task ATD: ${(await taskDetails.findById(task.parentTaskId)).ancestorTaskDescription}.
      
      Please ensure the ATD is clear, relevant to the current task, and provides the necessary context from its parent task.`;
      
      // Call AI to generate ATD
      const aiResponse = await generateAIResponse(prompt);
      console.log(aiResponse);

      // Update the task with the generated ATD
      task.ancestorTaskDescription = aiResponse;

      

      await task.save();
    }
    if(!task.parentTaskId&&(!task.ancestorTaskDescription || task.ancestorTaskDescription.trim() === '')){
      task.ancestorTaskDescription = task.description;
      await task.save();
    }

    // task.completedSubTasks=0;
    // await task.save();
    // Sort updates by updatedAt (most recent first)
    task.updates.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    // If task is found and user has access, return it
    res.status(200).json(task);
  } catch (error) {
    console.error("Error fetching task:", error);

    // Handle error (e.g., invalid ID format, database error)
    res.status(500).json({ message: "An error occurred while fetching the task" });
  }
});

module.exports = router;
