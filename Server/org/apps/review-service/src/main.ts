import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
const swaggerDocument = require('./swagger-output.json');

const app = express();

// Enable CORS for all origins in development
app.use(cors({
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400 // 24 hours
}))

// Handle pre-flight requests
app.options('*', cors());

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send({ 'message': 'Hello welcome to review service' });
});

// Routes
import router from './routes/review.router';
import commentRouter from './routes/comments';

// Swagger UI configuration
const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    url: "/docs-json",
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
  }
};

app.get("/docs-json", (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json(swaggerDocument);
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));
app.use('/reviews', router);
app.use('/comments', commentRouter);

// Error handling middleware should be last
app.use(errorMiddleware);

// Server

const port = process.env.PORT || 6002;
const server = app.listen(port, () => {
  console.log(`Review service running at port! ${port}`);
  console.log(`API docs at http://localhost:${port}/api-docs`);
});

server.on("error", (err) => {
  console.log("Server Error", err);
});
