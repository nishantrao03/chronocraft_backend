const express = require('express');
const router = express.Router();
const authenticate = require('../authenticate'); // Adjust path as per your project
const generateAIResponse = require('../google_gen_ai/text_generation'); // Import the AI generation function

// AI Response API
router.post('/api/airesponse', authenticate, async (req, res) => {
  try {
    // Extract prompt from the request body
    const { prompt } = req.body;

    // Check if the prompt is provided
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Call the AI generation function with the prompt
    const aiResponse = await generateAIResponse(prompt);

    // Return the generated AI response to the frontend
    res.status(200).json({ aiResponse });
  } catch (error) {
    console.error("Error generating AI response:", error);

    // Handle error and send a response back
    res.status(500).json({ error: "Failed to generate AI response" });
  }
});

module.exports = router;
