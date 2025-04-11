import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { socket } from '../services/socket';
import ChatIcon from '../components/ChatIcon';
import 'nes.css/css/nes.min.css'; // Import nes.css

function ChatRoom() {
  const { roomId } = useParams(); // Get the room ID from URL
  const location = useLocation();
  const navigate = useNavigate();
  const displayName = location.state?.displayName;
  const messagesEndRef = useRef(null);
  
  // State
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  
  // Redirect if no display name was provided
  useEffect(() => {
    if (!displayName) {
      navigate('/', { replace: true });
    }
  }, [displayName, navigate]);

  // Replace the useEffect block that handles socket connection with this:
  useEffect(() => {
    if (!displayName) return;

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
      setMessages((prevMessages) => [...prevMessages, newMessage]);
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
    
    // Only register event listeners once
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
      
      // Only emit leave_room if we're actually leaving the page
      // not just on React re-render
      if (socket.connected) {
        socket.emit('leave_room', { roomId });
        // Don't disconnect here - only disconnect when user navigates away
      }
    };
  }, [roomId, displayName]); // Remove navigate from dependencies
    
  // Handle browser navigation/refresh
  useEffect(() => {
    // This runs when the component unmounts during page navigation
    const handleBeforeUnload = () => {
      if (socket.connected) {
        socket.emit('leave_room', { roomId });
        socket.disconnect();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [roomId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle message input changes and emit typing events
  const handleMessageChange = (e) => {
    const text = e.target.value;
    setMessage(text);
    
    // Emit typing event
    socket.emit('typing', {
      roomId,
      isTyping: text.length > 0,
      text
    });
  };
  
  // Handle message submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (message.trim()) {
      // Send message
      socket.emit('send_message', {
        roomId,
        text: message
      });
      
      // Clear input and typing state
      setMessage('');
      socket.emit('typing', {
        roomId,
        isTyping: false,
        text: ''
      });
    }
  };
  
  // Handle leaving the room
  const handleLeaveRoom = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="nes-container is-rounded" style={{ 
      height: '100vh', 
      padding: '0',
      display: 'flex', 
      flexDirection: 'column',
      maxWidth: '100%',
      margin: '0',
      borderRadius: '0'
    }}>
      {/* Header */}
      <header style={{ 
        borderBottom: '4px solid #000', 
        padding: '8px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>
            <ChatIcon width={48} height={48} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <i className={`nes-icon ${isConnected ? 'heart' : 'heart is-empty'} is-small`} style={{ marginRight: '8px' }}></i>
          <span style={{ marginRight: '16px' }}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          <button 
            onClick={handleLeaveRoom}
            className="nes-btn is-error is-small"
          >
            Leave
          </button>
        </div>
      </header>
      
      {/* Messages area */}
      <div style={{ 
        flex: '1', 
        overflowY: 'auto', 
        padding: '16px',
        backgroundColor: '#f5f5f5'
      }}>
        {messages.map((msg, index) => (
          <div 
            key={index}
            className={`message-container ${msg.senderId === socket.id ? 'from-me' : 'from-them'}`}
            style={{ marginBottom: '16px', display: 'flex', justifyContent: msg.senderId === socket.id ? 'flex-end' : 'flex-start' }}
          >
            <div className={`nes-balloon ${msg.senderId === socket.id ? 'from-right' : 'from-left'}`} style={{ 
              maxWidth: '70%',
              wordBreak: 'break-word'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {msg.senderId === socket.id ? 'You' : msg.senderName}
              </div>
              <p style={{ margin: '0' }}>{msg.text}</p>
            </div>
          </div>
        ))}
        
        {/* Typing indicators */}
        {Object.entries(typingUsers).map(([userId, user]) => (
          <div 
            key={userId}
            className="message-container from-them"
            style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-start' }}
          >
            <div className="nes-balloon from-left is-dark" style={{ 
              maxWidth: '70%',
              opacity: '0.7',
              wordBreak: 'break-word'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {user.displayName} is typing...
              </div>
              <p style={{ margin: '0' }}>{user.text}</p>
            </div>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <div className="message-input">
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
          <div className="nes-field" style={{ flex: '1' }}>
            <input
              type="text"
              value={message}
              onChange={handleMessageChange}
              placeholder="Type a message..."
              className="nes-input"
            />
          </div>
          <button
            type="submit"
            className="nes-btn is-primary"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatRoom;