import axios from 'axios';
import validator from 'validator';
import { PDFDocument } from 'pdf-lib';
import { PDFImage } from 'pdf-image';
// import path from 'path';
import FormData from 'form-data';
import fs from 'fs';
import express from 'express';

const router = express.Router()

const extractTextFromImage = async (imagePath, apiKey, pageNumber) => {
  const form = new FormData();
  form.append('apikey', apiKey);
  form.append('language', 'eng');

  if (validator.isURL(imagePath)) {
    form.append('url', imagePath);
  } else {
    form.append('file', fs.createReadStream(imagePath));
  }

  try {
    const response = await axios.post('https://api.ocr.space/parse/image', form, {
      headers: form.getHeaders(),
    });
    const result = response.data;
    if (result.ParsedResults && result.ParsedResults.length > 0) {
      return result.ParsedResults[0].ParsedText;
    }
    else {
      console.error(`No parsed results for page ${pageNumber}:`, result);
      return null;
    }
  } catch (error) {
    console.error(`Error extracting text from image on page ${pageNumber}:`, error.message);
    return null;
  }
};

const convertPdfToImages = async (pdfUrl) => {
  try {
    const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    const pdfBuffer = Buffer.from(response.data);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pageCount = pdfDoc.getPageCount();
    const pdfImage = new PDFImage(pdfUrl);

    const images = [];
    for (let i = 0; i < pageCount; i++) {
      const imagePath = await pdfImage.convertPage(i);
      const imageSize = fs.statSync(imagePath).size / 1024; // size in KB
      if (imageSize > 1024) {
        console.log(`Page ${i + 1}: Image size ${imageSize.toFixed(2)} KB exceeds the limit.`);
        continue;
      }
      images.push({ path: imagePath, size: imageSize, page: i + 1 });
    }
    return images;
  } catch (error) {
    console.error('Error converting PDF to images:', error.message);
    return [];
  }
};

router.post('/', async (req, res) => {
  const { fileURLs } = req.body;
  const apiKey = 'K82829628288957';

  try {
    let allExtractedTexts = [];

    for (const fileURL of fileURLs) {
      if (validator.isURL(fileURL) && fileURL.endsWith('.pdf')) {
        const imagePaths = await convertPdfToImages(fileURL);
        const extractedTexts = [];

        for (const image of imagePaths) {
          if (image.size > 1000) {
            console.log(`Skipping page ${image.page} due to image size ${image.size.toFixed(2)} KB`);
            extractedTexts.push(`Page ${image.page}: Image size exceeds the limit`);
            continue;
          } else {
            const extractedText = await extractTextFromImage(image.path, apiKey, image.page);
            if (extractedText) {
              extractedTexts.push(extractedText);
            } else {
              extractedTexts.push(`Failed to extract text from page ${image.page}`);
            }
          }
        }
        allExtractedTexts.push(...extractedTexts);
      } 
      else {
        const extractedText = await extractTextFromImage(fileURL, apiKey, 0);
        if (extractedText) {
          allExtractedTexts.push(extractedText);
        } else {
          allExtractedTexts.push('Failed to extract text from image');
        }
      }
    }

    res.status(200).json({ texts: allExtractedTexts });
  } catch (error) {
    console.error('Error processing upload:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
// console.log(`Server is running on port ${PORT}`);
// });
// 

export { router as uploadRouter }