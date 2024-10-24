const TaskDetails = require('../models/taskDetails');

async function markComplete(taskId, userId, session) {
    try {
        // Start the transaction in the calling function, session is already passed
        // 1. Fetch the task using the task id
        const task = await TaskDetails.findById(taskId).session(session);

        if (!task) {
            // No task found, abort transaction
            return { status: 404, message: 'Task not found.' };
        }

        // 3. Check if userId is present in task.admins
        if (!task.admins.includes(userId)) {
            // Unauthorized, abort transaction
            return { status: 403, message: 'User is not authorized to complete this task.' };
        }

        // 4. Check if the number of completed subtasks is equal to the total subtasks
        if (task.completedSubTasks !== task.subTasks.length) {
            // Not all subtasks complete, abort transaction
            return { status: 400, message: 'All subtasks must be completed first.' };
        }

        // 5. Mark the task as complete
        task.status = 'finished';
        await task.save({ session }); // Ensure save happens within the session

        // 6. Iterate through the parent tasks and update their status
        let parentTaskId = task.parentTaskId;

        while (parentTaskId) {
            const parentTask = await TaskDetails.findById(parentTaskId).session(session); // Use session

            // 7. Increment the completedSubTasks field
            parentTask.completedSubTasks += 1;
            console.log("Completed sub tasks");
            console.log(parentTask.completedSubTasks);

            // 8. Check if the parent task's subtasks are all completed
            if (parentTask.completedSubTasks === parentTask.subTasks.length) {
                parentTask.status = 'finished';
                await parentTask.save({ session }); // Use session to save
                parentTaskId = parentTask.parentTaskId; // Continue with the next parent
            } else {
                await parentTask.save({ session }); // Save with session even if incomplete
                break; // Stop if parent task is not fully complete
            }
        }

        return { status: 200, message: 'Task marked complete successfully.' };
    } catch (error) {
        // In case of any error, return failure
        return { status: 500, message: 'Server error' };
    }
}

module.exports = markComplete;
