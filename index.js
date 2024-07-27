import express from 'express';
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'

import { GenerateSummary } from './Routes/GenerateSummary.js';
import { PromptAnswer } from './Routes/PromptAnswer.js';
import { ToTranslate } from './Routes/ToTranslate.js';
import { GetPrompts } from './Routes/GetPrompts.js';

dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());


app.use("/GenerateSummary", GenerateSummary)
app.use("/promptAnswer", PromptAnswer)
app.use("/toTranslate", ToTranslate)
app.use("/getPrompts", GetPrompts)

const PORT = 5555
app.listen(PORT, () => console.log("SERVER STARTED AT: " + PORT));