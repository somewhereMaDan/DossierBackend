// import FormData from 'form-data';
// import fs from 'fs';
// import express from 'express';
// import axios from 'axios';
// import validator from 'validator';
// import { PDFDocument } from 'pdf-lib';
// import { PDFImage } from 'pdf-image';

// const app = express();
// app.use(express.json());

// async function getContentType(url) {
//   try {
//     const response = await axios.head(url);
//     return response.headers['content-type'];
//   } catch (error) {
//     console.error('Error fetching content type:', error.message);
//     return null;
//   }
// }

// const extractTextFromImage = async (imagePath, apiKey) => {
//   const form = new FormData();
//   form.append('apikey', apiKey);
//   form.append('language', 'eng');

//   if (validator.isURL(imagePath)) {
//     form.append('url', imagePath);
//   } else {
//     form.append('file', fs.createReadStream(imagePath));
//   }

//   try {
//     const response = await axios.post('https://api.ocr.space/parse/image', form, {
//       headers: form.getHeaders(),
//     });
//     const result = response.data;
//     if (result.ParsedResults && result.ParsedResults.length > 0) {
//       return result.ParsedResults[0].ParsedText;
//     } else {
//       console.error('No parsed results:', result);
//       return null;
//     }
//   } catch (error) {
//     console.error('Error extracting text from image:', error.message);
//     return null;
//   }
// };

// const convertPdfToImages = async (pdfUrl) => {
//   try {
//     const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
//     const pdfBuffer = Buffer.from(response.data);
//     const pdfDoc = await PDFDocument.load(pdfBuffer);
//     const pageCount = pdfDoc.getPageCount();
//     const pdfImage = new PDFImage(pdfUrl);

//     const images = [];
//     for (let i = 0; i < pageCount; i++) {
//       const imagePath = await pdfImage.convertPage(i);
//       images.push(imagePath);
//     }
//     return images;
//   } catch (error) {
//     console.error('Error converting PDF to images:', error.message);
//     return [];
//   }
// };

// app.post('/upload', async (req, res) => {
//   const { fileURLs } = req.body;
//   const apiKey = 'K82829628288957';

//   try {
//     if (validator.isURL(fileURLs) && fileURLs.endsWith('.pdf')) {
//       const imagePaths = await convertPdfToImages(fileURLs);
//       const extractedTexts = [];

//       for (const imagePath of imagePaths) {
//         const extractedText = await extractTextFromImage(imagePath, apiKey);
//         if (extractedText) {
//           extractedTexts.push(extractedText);
//         } else {
//           extractedTexts.push('Failed to extract text');
//         }
//       }

//       res.status(200).json({ texts: extractedTexts });
//     } else {
//       const extractedText = await extractTextFromImage(fileURLs, apiKey);
//       if (extractedText) {
//         res.status(200).json({ text: extractedText });
//       } else {
//         res.status(400).json({ error: 'Failed to extract text from image' });
//       }
//     }
//   } catch (error) {
//     console.error('Error processing upload:', error.message);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

import express from 'express';
import cors from 'cors'

import { uploadRouter } from './Routes/upload.js';

const app = express();
app.use(express.json());
app.use(cors());

app.use("/upload", uploadRouter)

const PORT = 5555
app.listen(PORT, () => console.log("SERVER STARTED AT: " + PORT));