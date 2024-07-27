import axios from 'axios';
import express from 'express';

const router = express.Router()

async function getSummary(extractedTexts) {
  const allSummaries = [];

  const geminiApiKey = "AIzaSyDvdKaAqQsbJim30noP8mfkHNAl0Y8pwhM"

  for (const text of extractedTexts) {
    const summary = await summarizeTextWithGemini(text, geminiApiKey);
    allSummaries.push(summary);
  }

  return allSummaries;
}

async function summarizeTextWithGemini(text, geminiApiKey) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
  const headers = {
    "Content-Type": "application/json"
  };
  const data = {
    "contents": [
      {
        "parts": [
          {
            "text": "Please summarize the text content and if the content is too large, increase your summarization it should be atleast 300-400 words and The elements that it should contain are: 1)Main Idea: Clearly state the central theme or thesis of the content. This provides the reader with a quick understanding of what the text is about. 2)Key Points: Highlight the most important points or arguments made in the content. These are usually the sub-themes or supporting arguments that bolster the main idea. 3)Critical Details: Include significant facts, figures, or details that are crucial to understanding the content. Avoid minor details and focus on what is necessary for a comprehensive summary. 4)Purpose: Explain the purpose of the content. This could be to inform, persuade, entertain, or explain a concept. 5)Conclusion: Summarize the conclusion or final thoughts of the content. This often encapsulates the overall message or final takeaway the author wants to impart to the reader. 6) Structure: Maintain a logical flow that mirrors the structure of the original content, ensuring that the summary is cohesive and easy to follow." + text
          }
        ]
      }
    ]
  };
  const params = {
    "key": geminiApiKey
  };

  try {
    const response = await axios.post(url, data, { headers, params });
    if (response.data && response.data.candidates && response.data.candidates[0]) {
      const summarizedText = response.data.candidates[0].content.parts[0].text;
      return summarizedText;
    } else {
      console.error("Gemini API response does not contain valid data:", response.data);
      return null;
    }
  } catch (error) {
    console.error("Gemini API request failed:", error);
    return null;
  }
}

router.post("/", async (req, res) => {
  const { extractedText } = req.body;

  try {
    const allSummaries = await getSummary(extractedText);
    res.json({ summaries: allSummaries });
  } catch (error) {
    console.error('Error generating summaries:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

export { router as GenerateSummary }