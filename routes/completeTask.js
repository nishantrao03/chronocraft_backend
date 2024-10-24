const express = require('express');
const TaskDetails = require('../models/taskDetails');
const authenticate = require('../authenticate');
const markComplete = require('../taskUtils/markComplete');

const router = express.Router();

router.post('/api/tasks/:id/complete', authenticate, async (req, res) => {
    const { userId } = req.body;
    const taskId = req.params.id;

    // Start a new MongoDB session
    const session = await TaskDetails.startSession();

    try {
        session.startTransaction(); // Start the transaction

        // Call markComplete with the session
        const result = await markComplete(taskId, userId, session);

        if (result.status !== 200) {
            // Abort the transaction if there's an error
            await session.abortTransaction();
            return res.status(result.status).json({ message: result.message });
        }

        // Commit the transaction if everything is successful
        await session.commitTransaction();
        res.status(result.status).json({ message: result.message });
    } catch (error) {
        // If an error occurs, abort the transaction
        await session.abortTransaction();
        console.error('Transaction aborted due to error: ', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        session.endSession(); // End the session
    }
});

module.exports = router;
