import logger from './logger.js';

// Initialize Socket.IO with authentication and room management
export const initializeSocketIO = (io) => {
  logger.info('Initializing Socket.IO server...');

  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    // For now, allow all connections
    // In production, you would verify JWT tokens here
    logger.debug(`Socket connection attempt from ${socket.handshake.address}`);
    next();
  });

  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id}`);

    // Handle user authentication
    socket.on('authenticate', (data) => {
      try {
        // Verify user token and store user info
        socket.userId = data.userId;
        socket.userRole = data.userRole;
        socket.join(`user_${data.userId}`);
        
        logger.info(`User ${data.userId} authenticated with role ${data.userRole}`);
        socket.emit('authenticated', { success: true });
      } catch (error) {
        logger.error('Socket authentication failed:', error);
        socket.emit('auth_error', { message: 'Authentication failed' });
      }
    });

    // Handle joining load-specific rooms
    socket.on('join_load', (loadId) => {
      socket.join(`load_${loadId}`);
      logger.debug(`Socket ${socket.id} joined load room: load_${loadId}`);
    });

    // Handle leaving load-specific rooms
    socket.on('leave_load', (loadId) => {
      socket.leave(`load_${loadId}`);
      logger.debug(`Socket ${socket.id} left load room: load_${loadId}`);
    });

    // Handle chat messages
    socket.on('send_message', (data) => {
      try {
        const { roomId, message, type = 'text' } = data;
        
        // Validate message data
        if (!roomId || !message) {
          socket.emit('message_error', { message: 'Invalid message data' });
          return;
        }

        // Broadcast message to room
        const messageData = {
          id: Date.now().toString(),
          userId: socket.userId,
          message,
          type,
          timestamp: new Date().toISOString(),
        };

        io.to(roomId).emit('new_message', messageData);
        logger.debug(`Message sent to room ${roomId} by user ${socket.userId}`);
      } catch (error) {
        logger.error('Error handling chat message:', error);
        socket.emit('message_error', { message: 'Failed to send message' });
      }
    });

    // Handle load status updates
    socket.on('load_status_update', (data) => {
      try {
        const { loadId, status, location } = data;
        
        // Broadcast to all users watching this load
        io.to(`load_${loadId}`).emit('load_status_changed', {
          loadId,
          status,
          location,
          timestamp: new Date().toISOString(),
          updatedBy: socket.userId
        });

        logger.info(`Load ${loadId} status updated to ${status} by user ${socket.userId}`);
      } catch (error) {
        logger.error('Error handling load status update:', error);
      }
    });

    // Handle driver location updates
    socket.on('driver_location', (data) => {
      try {
        const { loadId, latitude, longitude, heading } = data;
        
        // Broadcast to dispatchers and load watchers
        io.to(`load_${loadId}`).emit('driver_location_update', {
          loadId,
          latitude,
          longitude,
          heading,
          timestamp: new Date().toISOString(),
          driverId: socket.userId
        });

        logger.debug(`Driver location updated for load ${loadId}`);
      } catch (error) {
        logger.error('Error handling driver location update:', error);
      }
    });

    // Handle emergency alerts
    socket.on('emergency_alert', (data) => {
      try {
        const { type, message, location } = data;
        
        // Broadcast to all dispatchers and admins
        io.emit('emergency_alert', {
          type,
          message,
          location,
          userId: socket.userId,
          timestamp: new Date().toISOString(),
        });

        logger.critical('Emergency alert received', {
          type,
          message,
          location,
          userId: socket.userId
        });
      } catch (error) {
        logger.error('Error handling emergency alert:', error);
      }
    });

    // Handle system notifications
    socket.on('system_notification', (data) => {
      try {
        const { targetUsers, message, type = 'info' } = data;
        
        if (targetUsers && targetUsers.length > 0) {
          targetUsers.forEach(userId => {
            io.to(`user_${userId}`).emit('notification', {
              message,
              type,
              timestamp: new Date().toISOString(),
            });
          });
        } else {
          // Broadcast to all connected users
          io.emit('notification', {
            message,
            type,
            timestamp: new Date().toISOString(),
          });
        }

        logger.info('System notification sent:', { message, type, targetUsers });
      } catch (error) {
        logger.error('Error handling system notification:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`User disconnected: ${socket.id}, reason: ${reason}`);
      
      if (socket.userId) {
        // Notify other users if needed
        socket.broadcast.emit('user_offline', {
          userId: socket.userId,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Handle connection errors
    socket.on('error', (error) => {
      logger.error('Socket error:', error);
    });
  });

  logger.info('Socket.IO server initialized successfully');
};

// Helper functions for sending notifications from the REST API
export const sendNotificationToUser = (io, userId, notification) => {
  io.to(`user_${userId}`).emit('notification', {
    ...notification,
    timestamp: new Date().toISOString(),
  });
};

export const sendLoadUpdate = (io, loadId, update) => {
  io.to(`load_${loadId}`).emit('load_update', {
    ...update,
    timestamp: new Date().toISOString(),
  });
};

export const broadcastSystemMessage = (io, message) => {
  io.emit('system_message', {
    message,
    timestamp: new Date().toISOString(),
  });
};

export default {
  initializeSocketIO,
  sendNotificationToUser,
  sendLoadUpdate,
  broadcastSystemMessage,
};
