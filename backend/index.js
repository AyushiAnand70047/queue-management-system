import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import db from './utils/db.js';
import ManagerModel from './models/Manager.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json())

// connect to db
db();

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try{
        const managers = new ManagerModel({ name, email, password });
        await managers.save();
        res.status(201).json(managers);
    }catch(err){
        res.status(500).json({ message: err.message });
    }
});

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`app listening on port ${port}`);
})