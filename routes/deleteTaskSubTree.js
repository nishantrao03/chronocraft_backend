const express = require('express');
const mongoose = require('mongoose'); // Ensure you import mongoose
const UserDetails = require('../models/userDetails'); // Import the UserDetails model
const TaskDetails = require('../models/taskDetails');
const authenticate = require('../authenticate');
const markComplete = require('../taskUtils/markComplete');
const taskTreeDFSTraversal = require('../taskUtils/taskTreeDFSTraversal');

const router = express.Router();

router.delete('/tasks/deletesubtree/:taskId', authenticate, async (req, res) => {
    const session = await mongoose.startSession(); // Start a new session
    session.startTransaction(); // Start the transaction

    try {
        const { taskId } = req.params;
        const userId = req.userId; // Assuming the authenticate middleware provides user id

        // 1. Fetch the task to be deleted
        const taskToDelete = await TaskDetails.findById(taskId).session(session); // Use session

        if (!taskToDelete) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // 2. Check if the user is an admin of the task
        if (!taskToDelete.admins.includes(userId)) {
            return res.status(403).json({ error: 'You do not have permission to delete this task' });
        }

        // 3. Handle parent task, if exists
        const parentTaskId = taskToDelete.parentTaskId;
        if (parentTaskId) {
            const parentTask = await TaskDetails.findById(parentTaskId).session(session); // Use session
            
            if (parentTask) {
                // Remove the task ID from the parent's subTasks array
                parentTask.subTasks = parentTask.subTasks.filter(subTaskId => subTaskId.toString() !== taskId);
                if (taskToDelete.status === 'finished') {
                    parentTask.completedSubTasks--;
                }

                // Mark the parent task as complete if all subtasks are complete
                if (taskToDelete.status === 'pending' || (taskToDelete.status === 'finished' && parentTask.status === 'pending')) {
                    if (parentTask.completedSubTasks === parentTask.subTasks.length) {
                        const result = await markComplete(parentTaskId, userId, session); // Pass session here
                        if (result.status !== 200) {
                            throw new Error(result.message); // Throw error to trigger rollback
                        }
                    }
                }

                await parentTask.save({ session }); // Save parent task with session
            }
        }

        // 4. Handle bulk user update (Implementation Below)
        const { taskIdsSet, usersSet } = await taskTreeDFSTraversal(taskId);

        // Bulk remove the task from users' task arrays
        await UserDetails.updateMany(
            { userID: { $in: Array.from(usersSet) } },
            { $pull: { tasks: { $in: Array.from(taskIdsSet) } } },
            { session } // Pass session here
        );

        // Delete all tasks in the subtree from TaskDetails
        await TaskDetails.deleteMany({ _id: { $in: Array.from(taskIdsSet) } }, { session }); // Pass session here

        // Commit the transaction if everything was successful
        await session.commitTransaction();
        res.status(200).json({ message: 'Task and subtree deleted successfully' });

    } catch (error) {
        // Rollback the transaction on error
        await session.abortTransaction();
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    } finally {
        session.endSession(); // End the session
    }
});

module.exports = router;
