// Use dotenv to load environment variables
require('dotenv').config();

// Function to dynamically import the GoogleGenerativeAI class and generate AI response
async function generateAIResponse(prompt) {
  try {
    // Dynamically import GoogleGenerativeAI using the `import()` function for ES module compatibility
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    // Initialize Google Generative AI with API Key
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate content using the provided prompt
    const result = await model.generateContent(prompt);

    // Return the generated response
    return result.response.text();
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw error; // Rethrow the error to handle it in the calling function if necessary
  }
}

// Export the function for use in other files
module.exports = generateAIResponse;
