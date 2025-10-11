/**
 * User Interactions Service
 * Handles real-time user interactions: upvotes, downvotes, comments, follows, etc.
 */

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '../../../generated/prisma';
import dotenv from 'dotenv';

// Import routes
import interactionRoutes, { setSocketIO as setInteractionSocketIO } from './routes/interactions';
import followRoutes, { setSocketIO as setFollowSocketIO } from './routes/follows';
import commentRoutes, { setSocketIO as setCommentSocketIO } from './routes/comments';

// Import socket handlers
import { setupSocketHandlers } from './socket/socketHandlers';

dotenv.config();

const app = express();
const server = createServer(app);
const prisma = new PrismaClient();

// Socket.IO setup
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/', limiter);

// Set socket IO instances for routes
setInteractionSocketIO(io);
setFollowSocketIO(io);
setCommentSocketIO(io);

// Make Prisma available to routes
app.locals.prisma = prisma;

// Routes
app.use('/interactions', interactionRoutes);
app.use('/follows', followRoutes);
app.use('/comments', commentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'user-interactions',
    timestamp: new Date().toISOString()
  });
});

// Setup Socket.IO handlers
setupSocketHandlers(io);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const port = process.env.PORT || 6005;

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    server.listen(port, () => {
      console.log(`🚀 User Interactions Service listening at http://localhost:${port}`);
      console.log(`📡 Socket.IO server ready for real-time interactions`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('👋 Gracefully shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export { io, prisma };
