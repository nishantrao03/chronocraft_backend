const express = require('express');
const TaskDetails = require('../models/taskDetails');
const authenticate = require('../authenticate');
const generateAIResponse = require('../google_gen_ai/text_generation');
const moment = require('moment'); // Ensure you have moment.js installed for date formatting

const router = express.Router();

// API Endpoint to break down the task
router.post('/breakdown-task', authenticate, async (req, res) => {
    const { taskId } = req.body;

    try {
        // Fetch the task from the database using the provided task ID
        const task = await TaskDetails.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Prepare the data for AI generation
        const taskDetails = {
            title: task.title,
            description: task.description,
            ATD: task.ancestorTaskDescription, // Assuming ATD is the same as description in this case
            deadline: moment(task.deadline).format('Do MMMM YYYY HH:mm'), // Format the deadline
            currentDate: moment().format('Do MMMM YYYY HH:mm') // Format the current date
        };

        // Create the prompt for AI generation
        const prompt = `
            I need assistance breaking down a task into smaller, manageable subtasks. 
            The task should be broken down into a hierarchical structure down to the smallest indivisible tasks. 
            Please provide a detailed breakdown based on the following information:

            Task Title: ${taskDetails.title}
            Task Description: ${taskDetails.description}
            Ancestor Task Description (ATD): ${taskDetails.ATD}
            Deadline: ${taskDetails.deadline}
            Current Date: ${taskDetails.currentDate}
            Instructions:
            Subtask Title: Provide a clear title that describes the action for each subtask.
            Subtask Description: Briefly explain what needs to be done for each subtask.
            Subtask Deadline: Calculate a proportional deadline for each subtask based on the task’s overall deadline and the current date.
            Important: The response should follow a structured, hierarchical breakdown of subtasks, each with its own title, description, and deadline. 
            Maintain a clear and concise format, with no extra details about the task title, description, or deadlines beyond what's needed. 
            Talk directly to the user and ensure the breakdown is easy to follow, as this application manages tasks in a tree-like structure.

            Example format:
            [Main Subtask 1 Title] (Deadline: [Date])
            1.1 [Subtask 1.1 Title] (Deadline: [Date])
            1.1.1 [Subtask 1.1.1 Title] (Deadline: [Date])
            1.1.1.1 Description: [Details of the action needed]
            [Main Subtask 2 Title] (Deadline: [Date])
            2.1 [Subtask 2.1 Title] (Deadline: [Date])
            2.1.1 [Subtask 2.1.1 Title] (Deadline: [Date])
            2.1.1.1 Description: [Details of the action needed]
        `;

        // Call the AI response generation function with the prompt
        const aiResponse = await generateAIResponse(prompt);

        // Respond with the generated breakdown
        return res.status(200).json({ breakdown: aiResponse });
    } catch (error) {
        console.error('Error fetching task or generating response:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
