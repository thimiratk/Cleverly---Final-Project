import { Server as SocketIOServer, Socket } from 'socket.io';

export const setupSocketHandlers = (io: SocketIOServer): void => {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // User joins their personal room for notifications
    socket.on('user:join', (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined personal room`);
    });

    // User joins a review room to receive real-time updates for that review
    socket.on('review:join', (reviewId: string) => {
      socket.join(`review:${reviewId}`);
      console.log(`Socket ${socket.id} joined review room: ${reviewId}`);
    });

    // User leaves a review room
    socket.on('review:leave', (reviewId: string) => {
      socket.leave(`review:${reviewId}`);
      console.log(`Socket ${socket.id} left review room: ${reviewId}`);
    });

    // Handle real-time upvote
    socket.on('review:upvote', (data: { reviewId: string; userId: string }) => {
      // Broadcast to all users in the review room
      socket.to(`review:${data.reviewId}`).emit('review:upvote', {
        ...data,
        timestamp: new Date()
      });
    });

    // Handle real-time downvote
    socket.on('review:downvote', (data: { reviewId: string; userId: string }) => {
      // Broadcast to all users in the review room
      socket.to(`review:${data.reviewId}`).emit('review:downvote', {
        ...data,
        timestamp: new Date()
      });
    });

    // Handle real-time vote removal
    socket.on('review:vote-removed', (data: { reviewId: string; userId: string }) => {
      // Broadcast to all users in the review room
      socket.to(`review:${data.reviewId}`).emit('review:vote-removed', {
        ...data,
        timestamp: new Date()
      });
    });

    // Handle real-time comment typing indicator
    socket.on('comment:typing', (data: { reviewId: string; userId: string; userName: string; isTyping: boolean }) => {
      socket.to(`review:${data.reviewId}`).emit('comment:typing', data);
    });

    // Handle real-time comment submission
    socket.on('comment:new', (data: { reviewId: string; comment: any }) => {
      // Broadcast to all users in the review room
      io.to(`review:${data.reviewId}`).emit('comment:new', data.comment);
    });

    // Handle real-time follow notification
    socket.on('user:follow', (data: { followerId: string; followingId: string; followerName: string }) => {
      // Send notification to the user being followed
      socket.to(`user:${data.followingId}`).emit('user:new-follower', {
        followerId: data.followerId,
        followerName: data.followerName,
        timestamp: new Date()
      });
    });

    // Handle real-time unfollow notification
    socket.on('user:unfollow', (data: { followerId: string; followingId: string }) => {
      // Send notification to the user being unfollowed
      socket.to(`user:${data.followingId}`).emit('user:lost-follower', {
        followerId: data.followerId,
        timestamp: new Date()
      });
    });

    // Handle user presence updates
    socket.on('user:online', (userId: string) => {
      socket.broadcast.emit('user:status-change', {
        userId,
        status: 'online',
        timestamp: new Date()
      });
    });

    socket.on('user:offline', (userId: string) => {
      socket.broadcast.emit('user:status-change', {
        userId,
        status: 'offline',
        timestamp: new Date()
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Middleware for authentication (optional)
  io.use((socket, next) => {
    // TODO: Add JWT token verification here if needed
    // const token = socket.handshake.auth.token;
    // if (token) {
    //   // Verify token and attach user to socket
    // }
    next();
  });

  console.log('Socket.IO handlers set up successfully');
};