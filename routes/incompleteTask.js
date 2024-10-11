const express = require('express');
const TaskDetails = require('../models/taskDetails');
const authenticate = require('../authenticate');

const router = express.Router();

router.post('/api/tasks/:id/incomplete', authenticate, async (req, res) => {
    try {
        // 1. Fetch the task using the task id
        const task = await TaskDetails.findById(req.params.id);

        //2. If task is pending, throw error
        if (task.status === 'pending') {
            return res.status(400).json({ message: 'Task is already incomplete.' });
        }

        // 3. Mark the task as incomplete
        task.status = 'pending';
        await task.save();

        // 4. Iterate through the parent tasks and update their status
        let parentTaskId = task.parentTaskId;

        while (parentTaskId) {
            const parentTask = await TaskDetails.findById(parentTaskId);
            //console.log(parentTask.title);

            // 5. Increment the completedSubTasks field
            parentTask.completedSubTasks -= 1;

            // 6. Check if the parent task's subtasks are all completed
            if (parentTask.completedSubTasks === parentTask.subTasks.length-1) {
                parentTask.status = 'pending';
                await parentTask.save();
                parentTaskId = parentTask.parentTaskId; // Continue with the next parent
            } else {
                await parentTask.save();
                break; // Stop if parent task is not fully complete
            }
        }

        res.status(200).json({ message: 'Task marked incomplete successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
