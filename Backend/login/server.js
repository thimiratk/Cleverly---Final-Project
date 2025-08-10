import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import connectDB from './config/mongodb.js';


const app = express();
const PORT = process.env.PORT || 4000;
connectDB();


app.use(express.json());
app.use(cors({credentials: true}));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Api running');
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`)) ;
