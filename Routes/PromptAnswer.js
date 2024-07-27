import axios from 'axios';
import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router()

const promptsFilePath = path.join(process.cwd(), 'prompts.txt');

const savePromptIfNew = async (prompt) => {
  try {
    let existingPrompts = [];
    if (fs.existsSync(promptsFilePath)) {
      const data = await fs.promises.readFile(promptsFilePath, 'utf-8');
      existingPrompts = data.split('\n').map(p => p.trim());
    }

    if (!existingPrompts.includes(prompt)) {
      await fs.promises.appendFile(promptsFilePath, prompt + '\n');
    }
  } catch (error) {
    console.error(`An error occurred while saving the prompt: ${error}`);
  }
};

router.post('/', async (req, res) => {
  const { prompt: question, TotalFileNames, extractedText } = req.body;

  let finalPrompt = '';

  for (let index = 0; index < extractedText.length; index++) {
    finalPrompt += `Starting Point of the text Content of the File starts from here - \n File: ${index + 1}, File Name: ${TotalFileNames[index]}\nTextValue of File:\n${extractedText[index]}\nEnding Point of text content of the File is ends here.\n\n\n`;
  }

  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
  const headers = {
    "Content-Type": "application/json"
  };
  const data = {
    "contents": [
      {
        "parts": [
          {
            "text": `Hi I'm gonna give you some text Contents of PDFs(for better understanding I'm using a Starting point and Ending point so you can know from where a text content of PDF starts and where it ends, also it contains the name of the pdf and serial number), please analyze it and after that please answer a question. So text Contents of PDFs are:\n${finalPrompt}\nNow after analyzing it please answer the following question:${question}`
          }
        ]
      }
    ]
  };
  const params = {
    "key": "AIzaSyDvdKaAqQsbJim30noP8mfkHNAl0Y8pwhM"
  };

  try {
    const response = await axios.post(url, data, { headers, params });
    const result = response.data;

    console.log("Gemini API response:", result);  // Log the response

    if (result.candidates && result.candidates[0]) {
      const FinalAnswer = result.candidates[0].content.parts[0].text;

      // Implement save_prompt_if_new function or logic here if needed
      savePromptIfNew(question);

      res.json({ FinalAnswer });
    } else {
      const errorMessage = "Gemini API response does not contain valid data";
      console.error(errorMessage, result);
      res.status(500).json({ error: errorMessage });
    }
  } catch (error) {
    const errorMessage = `Gemini API request failed: ${error.message}`;
    console.error(errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

export { router as PromptAnswer }