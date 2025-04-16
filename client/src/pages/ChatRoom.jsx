import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import useChat from '../services/chatService';
import ChatIcon from '../components/ChatIcon';
import 'nes.css/css/nes.min.css'; // Import nes.css

function ChatRoom() {
  const { roomId } = useParams(); // Get the room ID from URL
  const location = useLocation();
  const navigate = useNavigate();
  const displayName = location.state?.displayName;
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null); // Ref for input element
  
  // State
  const [message, setMessage] = useState('');
  
  // Use our chat service hook
  const { 
    messages, 
    typingUsers, 
    isConnected, 
    sendMessage,
    setTypingStatus,
    leaveRoom
  } = useChat(roomId, displayName);
  
  // Redirect if no display name was provided
  useEffect(() => {
    if (!displayName) {
      navigate('/', { replace: true });
    }
  }, [displayName, navigate]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Scroll to bottom when someone is typing
  useEffect(() => {
    // Only scroll if there are typing users (someone is typing)
    if (Object.keys(typingUsers).length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [typingUsers]);
  
  // Handle message input changes and emit typing events
  const handleMessageChange = (e) => {
    const text = e.target.value;
    setMessage(text);
    
    // Update typing status
    setTypingStatus(text.length > 0, text);
  };
  
  // Handle message submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Refocus input
    if (inputRef.current) {
      inputRef.current.focus();
    }

    if (message.trim()) {
      // Send message
      sendMessage(message);
      
      // Clear input
      setMessage('');
    }
  };
  
  // Handle leaving the room
  const handleLeaveRoom = () => {
    leaveRoom();
    navigate('/', { replace: true });
  };

  return (
    <div className="nes-container is-rounded" id="messagearea" style={{ 
      height: '100dvh', 
      padding: '0',
      display: 'flex', 
      flexDirection: 'column',
      width: '100%',
      margin: '0 auto', /* Add 'auto' to left and right margins for centering */
      borderRadius: '0',
      maxWidth: '800px' /* Limit max width for desktop screens */
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
        {messages.map((msg, index) => {
          if (msg.type === 'system') {
            // System message
            return (
              <div 
                key={index}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  marginBottom: '16px',
                  marginTop: '16px'
                }}
              >
                <div className="nes-container is-rounded is-dark" style={{ 
                  textAlign: 'center',
                  display: 'inline-block',
                  padding: '8px 16px'
                }}>
                  <span>{msg.text}</span>
                  {msg.text.includes("joined") && msg.userCount && (
                    <span>{msg.userCount === 1 ? " They're the only one here." : ` There are now ${msg.userCount} people in the room.`}</span>
                  )}
                </div> 
              </div>
            );
          } else {
            // Regular message
            return (
              <div 
                key={index}
                className={`message-container ${msg.senderId === msg.currentUserId ? 'from-me' : 'from-them'}`}
                style={{ marginBottom: '16px', display: 'flex', justifyContent: msg.senderId === msg.currentUserId ? 'flex-end' : 'flex-start' }}
              >
                <div className={`nes-balloon ${msg.senderId === msg.currentUserId ? 'from-right' : 'from-left'}`} style={{ 
                  maxWidth: '70%',
                  wordBreak: 'break-word'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {msg.senderId === msg.currentUserId ? 'You' : msg.senderName}
                  </div>
                  <p style={{ margin: '0' }}>{msg.text}</p>
                </div>
              </div>
            );
          }
        })}
        
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
                {user.displayName} is typing<span className="typing-dots"></span>
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
              ref={inputRef}
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