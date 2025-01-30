const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"; // ✅ Correct URL

router.post("/summarize", async (req, res) => {
  const { content } = req.body;
  console.log("Received content:", content);

  if (!content) {
    return res.status(400).json({ error: "Content is required for summarization." });
  }

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "llama-3.3-70b-versatile", // ✅ Ensure this model is available
        messages: [
          { 
            role: "user", 
            content: `Summarize the following blog post into **key points**. Ensure that:
            - The summary **captures all important details**.
            - It is **concise and well-structured**.
            - No key information is omitted.
            - The response follows the given format.
    
            Blog Content:
            """ 
            ${content} 
            """
    
            **Summary Format**:
            - **Main Idea**: [A single-sentence summary of the blog]
            - **Key Points**:
              1. [Most important takeaway]
              2. [Second key insight]
              3. [Third essential point]
              4. [Any additional critical info]
            - **Conclusion**: [Final takeaway or impact]
            
            Make sure the summary is **fully complete** and **does not leave out crucial points**.`
          }
        ],
        max_tokens: 250, // Increased tokens for completeness
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    

    // console.log("Groq API response:", response.data);

    if (response.data.choices?.length > 0) {
      const summary = response.data.choices[0].message.content.trim();
      return res.json({ summary });
    } else {
      throw new Error("No summary returned.");
    }
  } catch (error) {
    console.error("Error with Groq API:", error.response?.data || error.message || error);

    if (error.response?.status === 401) {
      return res.status(401).json({ error: "Invalid API key." });
    }
    if (error.response?.status === 404) {
      return res.status(404).json({ error: "Model not found. Check available models in Groq API docs." });
    }

    res.status(500).json({ error: "Summarization failed." });
  }
});

module.exports = router;
