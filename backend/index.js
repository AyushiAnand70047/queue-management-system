import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import db from './utils/db.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json())

// connect to db
db();

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`app listening on port ${port}`);
})