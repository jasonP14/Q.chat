function handleSocketConnections(io) {
    // Store active users by room
    const activeRooms = new Map();
  
    io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);
      let currentRoom = null;
      let currentUser = null;
  
      // Handle joining a room
      socket.on('join_room', ({ roomId, displayName }) => {
        // Store user data
        currentRoom = roomId;
        currentUser = {
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
        activeRooms.get(roomId).set(socket.id, currentUser);
  
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
        if (roomId !== currentRoom || !currentUser) return;
  
        const messageData = {
          senderId: socket.id,
          senderName: currentUser.displayName,
          text,
          timestamp: Date.now()
        };
  
        // Broadcast to everyone in the room (including sender)
        io.to(roomId).emit('message', messageData);
      });
  
      // Handle typing indicators
      socket.on('typing', ({ roomId, isTyping, text }) => {
        if (roomId !== currentRoom || !currentUser) return;
  
        // Broadcast typing status to everyone except the sender
        socket.to(roomId).emit('user_typing', {
          userId: socket.id,
          displayName: currentUser.displayName,
          isTyping,
          text
        });
      });
  
      // Handle leaving room
      socket.on('leave_room', ({ roomId }) => {
        handleUserLeaving(socket, roomId);
      });
  
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        
        if (currentRoom) {
          handleUserLeaving(socket, currentRoom);
        }
      });
  
      // Helper function to handle a user leaving
      function handleUserLeaving(socket, roomId) {
        if (!activeRooms.has(roomId)) return;
  
        const roomUsers = activeRooms.get(roomId);
        const user = roomUsers.get(socket.id);
        
        if (user) {
          // Remove user from room
          roomUsers.delete(socket.id);
          
          // Clean up empty rooms
          if (roomUsers.size === 0) {
            activeRooms.delete(roomId);
            console.log(`Room ${roomId} is now empty and has been removed`);
          }
  
          // Notify room that user has left
          io.to(roomId).emit('message', {
            type: 'system',
            text: `${user.displayName} has left the room`,
            timestamp: Date.now()
          });
  
          // Leave the socket.io room
          socket.leave(roomId);
          
          // Reset current state
          if (currentRoom === roomId) {
            currentRoom = null;
            currentUser = null;
          }
  
          console.log(`User ${socket.id} (${user.displayName}) left room: ${roomId}`);
          if (activeRooms.has(roomId)) {
            console.log(`Active users in ${roomId}:`, Array.from(activeRooms.get(roomId).values()));
          }
        }
      }
    });
  }
  
  module.exports = { handleSocketConnections };