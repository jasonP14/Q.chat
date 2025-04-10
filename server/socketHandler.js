function handleSocketConnections(io) {
  // Store active users by room
  const activeRooms = new Map();
  // Track user's current room to prevent duplicate join/leave events
  const userRooms = new Map(); // Maps socket.id to roomId

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle joining a room
    socket.on('join_room', ({ roomId, displayName }) => {
      // Check if user is already in this room to prevent duplicate joins
      const currentRoom = userRooms.get(socket.id);
      if (currentRoom === roomId) {
        return; // User is already in this room
      }

      // If user is in a different room, leave it first
      if (currentRoom && currentRoom !== roomId) {
        handleUserLeaving(socket, currentRoom, false); // Leave quietly
      }

      // Store user data
      userRooms.set(socket.id, roomId);
      const userData = {
        id: socket.id,
        displayName
      };

      // Join the socket.io room
      socket.join(roomId);

      // Initialize room if it doesn't exist
      if (!activeRooms.has(roomId)) {
        activeRooms.set(roomId, new Map());
      }

      // Add user to the active room
      activeRooms.get(roomId).set(socket.id, userData);

      // Notify the room about the new user
      io.to(roomId).emit('message', {
        type: 'system',
        text: `${displayName} has joined the room`,
        timestamp: Date.now()
      });

      console.log(`User ${socket.id} (${displayName}) joined room: ${roomId}`);
      console.log(`Active users in ${roomId}:`, Array.from(activeRooms.get(roomId).values()));
    });

    // Handle sending messages
    socket.on('send_message', ({ roomId, text }) => {
      const currentRoom = userRooms.get(socket.id);
      if (roomId !== currentRoom || !activeRooms.has(roomId)) return;

      const userInfo = activeRooms.get(roomId).get(socket.id);
      if (!userInfo) return;

      const messageData = {
        senderId: socket.id,
        senderName: userInfo.displayName,
        text,
        timestamp: Date.now()
      };

      // Broadcast to everyone in the room (including sender)
      io.to(roomId).emit('message', messageData);
    });

    // Handle typing indicators
    socket.on('typing', ({ roomId, isTyping, text }) => {
      const currentRoom = userRooms.get(socket.id);
      if (roomId !== currentRoom || !activeRooms.has(roomId)) return;

      const userInfo = activeRooms.get(roomId).get(socket.id);
      if (!userInfo) return;

      // Broadcast typing status to everyone except the sender
      socket.to(roomId).emit('user_typing', {
        userId: socket.id,
        displayName: userInfo.displayName,
        isTyping,
        text
      });
    });

    // Handle leaving room
    socket.on('leave_room', ({ roomId }) => {
      if (userRooms.get(socket.id) === roomId) {
        handleUserLeaving(socket, roomId, true);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      
      const roomId = userRooms.get(socket.id);
      if (roomId) {
        handleUserLeaving(socket, roomId, true);
      }
      
      // Clean up the user tracking
      userRooms.delete(socket.id);
    });

    // Helper function to handle a user leaving
    function handleUserLeaving(socket, roomId, notifyRoom) {
      if (!activeRooms.has(roomId)) return;

      const roomUsers = activeRooms.get(roomId);
      const user = roomUsers.get(socket.id);
      
      if (user) {
        // Remove user from room
        roomUsers.delete(socket.id);
        
        // Remove from tracking
        userRooms.delete(socket.id);
        
        // Clean up empty rooms
        if (roomUsers.size === 0) {
          activeRooms.delete(roomId);
          console.log(`Room ${roomId} is now empty and has been removed`);
        }

        // Only notify if specified (prevents notification during room switching)
        if (notifyRoom) {
          // Notify room that user has left
          io.to(roomId).emit('message', {
            type: 'system',
            text: `${user.displayName} has left the room`,
            timestamp: Date.now()
          });
        }

        // Leave the socket.io room
        socket.leave(roomId);
        
        console.log(`User ${socket.id} (${user.displayName}) left room: ${roomId}`);
        if (activeRooms.has(roomId)) {
          console.log(`Active users in ${roomId}:`, Array.from(activeRooms.get(roomId).values()));
        }
      }
    }
  });
}

module.exports = { handleSocketConnections };