import axios from 'axios';
import express from 'express';
import dotenv from 'dotenv'
import pkg from '@google-cloud/translate';

const { Translate } = pkg.v2;

dotenv.config();

const router = express.Router()

const translate = new Translate({
  credentials: JSON.parse(process.env.TRANSLATE_ENV)
});

router.post('/', async (req, res) => {
  try {
    const inputText = req.body.all_summaries;
    const selectedLanguage = req.body.selectedLanguage;

    if (!inputText) {
      return res.status(400).json({ error: "No text provided for translation" });
    }

    if (!selectedLanguage) {
      return res.status(400).json({ error: "No language selected" });
    }

    const languageMap = {
      "English": "en",
      "Spanish": "es",
      "German": "de",
      "Chinese": "zh"
    };

    if (!languageMap[selectedLanguage]) {
      return res.status(400).json({ error: "Invalid language selected" });
    }

    const targetLanguage = languageMap[selectedLanguage];
    const translatedTexts = [];

    for (const text of inputText) {
      const [translation] = await translate.translate(text, targetLanguage);
      translatedTexts.push(translation);
    }

    res.status(200).json({ translated_texts: translatedTexts });
  } catch (error) {
    console.error("Exception:", error);
    res.status(500).json({ error: `Exception: ${error.message}` });
  }
});

export { router as ToTranslate }