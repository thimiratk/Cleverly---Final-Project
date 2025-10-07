/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import express from 'express';
import cors from 'cors';
import domainRoutes from './routes/domain.routes';

const app = express();

app.use(cors({
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400 // 24 hours
}))

app.use(express.json());

// API routes
app.use('/api', domainRoutes);

// Default route
app.get('/', (_, res) => {
  res.send('🌐 Domain Management API is running');
});

const PORT = process.env.PORT || 6003;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));



