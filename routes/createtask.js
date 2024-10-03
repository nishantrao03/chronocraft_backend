const express = require('express');
const UserDetails = require('../models/userDetails'); // Import the UserDetails model
const TaskDetails = require('../models/taskDetails');
const authenticate = require('../authenticate');

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

          // 4. If the parent task exists, set the parentTaskId field for the new task
          newTask.parentTaskId = parentTaskId;

          // 5. Save the new task to generate a unique ID for it
          await newTask.save();
          console.log("Debug 1.3");

          // 6. Add the new task's ID to the subtasks array of the parent task
          parentTask.subTasks.push(newTask._id);

          // 7. Save the updated parent task with the new subtask
          await parentTask.save();
          console.log("Debug 2");
      } else {
          // If no parentTaskId is provided, just save the new task
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