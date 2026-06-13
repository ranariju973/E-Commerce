import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import reviewRouter from './routes/reviewRoute.js';
import mongoose from 'mongoose';

//app config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

//middlewares
app.use(cors());
app.use(express.json());

//api endpoints
app.use('/api/user', userRouter)

app.use('/api/product', productRouter);

app.use('/api/cart', cartRouter);

app.use('/api/order', orderRouter);

app.use('/api/reviews', reviewRouter);

app.get(['/health', '/api/health'], (req, res) => {
    res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

app.get('/', (req, res) => {
    res.status(200).send('Hello World!');
});


//listen
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});