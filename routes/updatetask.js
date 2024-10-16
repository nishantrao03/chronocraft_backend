const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const UserDetails = require('../models/userDetails'); // Import the UserDetails model
const TaskDetails = require('../models/taskDetails');
const authenticate = require('../authenticate');
const generateAIResponse = require('../google_gen_ai/text_generation');

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

        // Fetch the parent task to generate the ATD
        const parentTaskId = task.parentTaskId; // Assuming there is a parent field in the task

        if (parentTaskId) {
            const parentTask = await TaskDetails.findById(parentTaskId);
            // Generate the prompt for the AI
            const prompt = `Given the following context, generate a concise description (maximum 100 words) that summarizes the task in relation to its ancestor tasks. This description will serve as the task's 'Ancestor Task Description' (ATD) for reference purposes.

            Current Task Description: ${updatedTask.description}. 
            Parent Task ATD: ${parentTask ? parentTask.ancestorTaskDescription : ''}.`;

            // Generate ATD using AI
            const aiResponse = await generateAIResponse(prompt);
            console.log(aiResponse); // This will log the generated ATD

              // Include the generated ATD in the updatedTask object
            updatedTask.ancestorTaskDescription = aiResponse;
        }
        else{
          updatedTask.ancestorTaskDescription = updatedTask.description;
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
