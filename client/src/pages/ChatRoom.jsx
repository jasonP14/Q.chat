import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { socket } from '../services/socket';

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

  // Handle socket connection and events
  useEffect(() => {
    if (!displayName) return;

    // Connect to socket
    socket.connect();
    
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
    
    // Register socket event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('message', onMessage);
    socket.on('user_typing', onUserTyping);
    
    // Clean up on unmount
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('message', onMessage);
      socket.off('user_typing', onUserTyping);
      socket.emit('leave_room', { roomId });
      socket.disconnect();
    };
  }, [roomId, displayName, navigate]);
  
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
    <div className="flex flex-col h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-indigo-600 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <h1 className="text-lg font-semibold text-slate-800">
            Room: {roomId}
          </h1>
        </div>
        <div className="flex items-center">
          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-sm text-slate-600 mr-4">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          <button 
            onClick={handleLeaveRoom}
            className="text-sm px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors"
          >
            Leave
          </button>
        </div>
      </header>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => (
          <div 
            key={index}
            className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
            //   msg.senderId === socket.id 
            //     ? 'bg-indigo-500 text-white ml-auto' 
            //     : 'bg-white text-slate-800 border border-slate-200'
                msg.senderId === socket.id
                ? 'bg-white text-slate-800 ml-auto'
                : 'bg-indigo-500 text-white border border-slate-200'
            }`}
          >
            <div className="text-xs mb-1 font-medium">
              {msg.senderId === socket.id ? 'You' : msg.senderName}
            </div>
            <div>{msg.text}</div>
          </div>
        ))}
        
        {/* Typing indicators */}
        {Object.entries(typingUsers).map(([userId, user]) => (
          <div 
            key={userId}
            className="max-w-xs md:max-w-md px-4 py-2 rounded-lg bg-white text-slate-500 border border-slate-200 opacity-75"
          >
            <div className="text-xs mb-1 font-medium">
              {user.displayName} is typing...
            </div>
            <div>{user.text}</div>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <div className="bg-white border-t border-slate-200 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={handleMessageChange}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatRoom;