import axios from 'axios';
import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router()

const promptsFilePath = path.join(process.cwd(), 'prompts.txt');

router.get('/', async (req, res) => {
  try {
    if (fs.existsSync(promptsFilePath)) {
      const data = await fs.promises.readFile(promptsFilePath, 'utf-8');
      const prompts = data.split('\n').map(prompt => prompt.trim()).filter(prompt => prompt.length > 0);
      res.status(200).json({ prompts });
    } else {
      res.status(200).json({ prompts: [] });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { router as GetPrompts }