const TaskDetails = require('../models/taskDetails');

// DFS function to collect task IDs and users
async function taskTreeDFSTraversal(taskId) {
    const taskIdsSet = new Set();
    const usersSet = new Set();

    // Stack-based DFS traversal
    const stack = [taskId];

    while (stack.length > 0) {
        const currentTaskId = stack.pop();

        // Fetch only subTasks and users arrays for each task
        const currentTask = await TaskDetails.findById(currentTaskId, 'subTasks users').exec();
        if (!currentTask) {
            continue;
        }

        // Add the current task ID to taskIdsSet
        taskIdsSet.add(currentTaskId);

        // Add all users of this task to usersSet
        currentTask.users.forEach(userId => {
            usersSet.add(userId.toString()); // Store users as strings for consistency
        });

        // Push all subtask IDs onto the stack for further traversal
        currentTask.subTasks.forEach(subTaskId => {
            stack.push(subTaskId.toString());
        });
    }

    return { taskIdsSet, usersSet };
}

module.exports = taskTreeDFSTraversal;