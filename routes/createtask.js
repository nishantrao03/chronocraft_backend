const express = require('express');
const UserDetails = require('../models/userDetails'); // Import the UserDetails model
const TaskDetails = require('../models/taskDetails');
const authenticate = require('../authenticate');
const generateAIResponse = require('../google_gen_ai/text_generation');

const router = express.Router();

router.post('/api/tasks', authenticate, async (req, res) => {
    try {
      const newTask = new TaskDetails(req.body);
      console.log("Debug 1");

      // 2. If a parentTaskId is provided, fetch the parent task
      if (req.body.parentTaskId) {
          const parentTaskId = req.body.parentTaskId;
          console.log("Debug 1.1");

          // Fetch the parent task from the database
          const parentTask = await TaskDetails.findById(parentTaskId);
          console.log("Debug 1.2");

          // 3. If no such parent task exists, return a 404 error
          if (!parentTask) {
              return res.status(404).json({ error: 'Parent task not found' });
          }

          // 4. Check if the user is an admin of the parent task
          const userId = newTask.admins[0]; 
          const isAdmin = parentTask.admins.includes(userId);

          if (!isAdmin) {
              return res.status(403).json({ error: 'You are not authorized to add subtasks to this task.' });
          }

          // 5. If the parent task exists, set the parentTaskId field for the new task
          newTask.parentTaskId = parentTaskId;

          //6. Generate the ancestor task description for the task
          const prompt = `Given the following context, generate a concise description (maximum 100 words) that summarizes the task in relation to its ancestor tasks. This description will serve as the task's 'Ancestor Task Description' (ATD) for reference purposes.

          Current Task Description: ${newTask.description}. 
          Parent Task ATD: ${parentTask.ancestorTaskDescription}.

          Please ensure the ATD is clear, relevant to the current task, and provides the necessary context from its parent task.`;

          const aiResponse = await generateAIResponse(prompt); // Generate ATD using AI
          console.log(aiResponse);

          // Set the generated ATD in the new task
          newTask.ancestorTaskDescription = aiResponse;

          // 6. Save the new task to generate a unique ID for it
          await newTask.save();
          console.log("Debug 1.3");

          // 7. Add the new task's ID to the subtasks array of the parent task
          parentTask.subTasks.push(newTask._id);

          // 8. Save the updated parent task with the new subtask
          await parentTask.save();
          console.log("Debug 2");

      } else {
          // If no parentTaskId is provided, just save the new task
          newTask.ancestorTaskDescription = newTask.description;
          await newTask.save();
          console.log("Debug 3");
      }
    console.log("Debug 4");


        const userID = newTask.admins[0];
        const updatedUser = await UserDetails.findOneAndUpdate(
            { userID: userID }, // Filter criteria to find the user
            { $push: { tasks: newTask._id } }, // Update operation to push the new task UID to the tasks array
            { new: true } // Return the updated document after the update operation
        );
        //console.log(updatedUser);
        res.status(201).json({ message: 'Task created successfully' });
      } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
});

module.exports = router;