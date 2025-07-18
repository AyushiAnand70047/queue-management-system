import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import db from './utils/db.js';
import router from './routes/manager.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json())

// connect to db
db();

app.use('/manager', router);

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`app listening on port ${port}`);
})