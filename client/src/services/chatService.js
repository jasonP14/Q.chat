import { useState, useEffect } from 'react';
import { socket } from './socket'; // Keep your existing socket initialization

// Import sound effects
import sentSound from '../assets/sent.mp3';
import receivedSound from '../assets/received.mp3';

function useChat(roomId, displayName) {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!displayName || !roomId) return;

    // Connect to socket if not already connected
    if (!socket.connected) {
      socket.connect();
    }
    
    // Join the room
    socket.emit('join_room', { roomId, displayName });
    
    // Socket event handlers
    function onConnect() {
      setIsConnected(true);
    }
    
    function onDisconnect() {
      setIsConnected(false);
    }
    
    function onMessage(newMessage) {
      // Add current user ID to each message for easier rendering
      const messageWithUserId = {
        ...newMessage,
        currentUserId: socket.id
      };
      
      setMessages((prevMessages) => [...prevMessages, messageWithUserId]);
      
      // Play received sound only if the message is not from the current user
      if (newMessage.senderId !== socket.id) {
        const audio = new Audio(receivedSound);
        audio.play();
      }
    }
    
    function onUserTyping({ userId, displayName, isTyping, text }) {
      setTypingUsers(prev => {
        if (isTyping) {
          return { ...prev, [userId]: { displayName, text } };
        } else {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        }
      });
    }
    
    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('message', onMessage);
    socket.on('user_typing', onUserTyping);
    
    // Handle connection status
    if (socket.connected) {
      setIsConnected(true);
    }
    
    // Clean up on unmount
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('message', onMessage);
      socket.off('user_typing', onUserTyping);
      
      // Only emit leave_room if we're actually connected
      if (socket.connected) {
        socket.emit('leave_room', { roomId });
      }
    };
  }, [roomId, displayName]);

  // Handle browser navigation/refresh - can also be called manually
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socket.connected) {
        socket.emit('leave_room', { roomId });
        socket.disconnect();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [roomId]);

  // Function to send a message
  const sendMessage = (text) => {
    socket.emit('send_message', {
      roomId,
      text
    });
    
    // Play sent sound
    const audio = new Audio(sentSound);
    audio.play();
    
    // Clear typing status
    setTypingStatus(false, '');
  };

  // Function to set typing status
  const setTypingStatus = (isTyping, text) => {
    socket.emit('typing', {
      roomId,
      isTyping,
      text
    });
  };

  // Function to leave the room
  const leaveRoom = () => {
    if (socket.connected) {
      socket.emit('leave_room', { roomId });
    }
  };

  return {
    messages,
    typingUsers,
    isConnected,
    sendMessage,
    setTypingStatus,
    leaveRoom
  };
}

export default useChat;