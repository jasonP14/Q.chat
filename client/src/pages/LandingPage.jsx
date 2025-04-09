import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  // State hooks to store the user's input
  const [displayName, setDisplayName] = useState('');
  const [roomName, setRoomName] = useState('');
  // Hook from react-router-dom to programmatically navigate
  const navigate = useNavigate();

  // Function to handle form submission
  const handleJoinChat = (event) => {
    event.preventDefault(); // Prevent default form submission

    // Basic validation
    if (displayName.trim() && roomName.trim()) {
      // Navigate to the chat room URL, passing displayName via route state
      navigate(`/${roomName.trim().toLowerCase().replace(/\s+/g, '-')}`, { // Sanitize room name for URL
        state: { displayName: displayName.trim() }
      });
    } else {
      // Consider replacing alert with a more integrated UI message
      alert('Please enter both a display name and a room name.');
    }
  };

  return (
    <div className="bg-slate-100 flex items-center justify-center h-screen">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
        <div className="flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-indigo-600 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <h1 className="text-2xl font-semibold text-slate-800">Kath</h1>
        </div>

        <form onSubmit={handleJoinChat}>
          <div className="mb-4">
            <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 mb-1">Display Name</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              placeholder="Enter your name"
              aria-label="Display Name"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150 ease-in-out"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="roomName" className="block text-sm font-medium text-slate-700 mb-1">Room Name</label>
            <input
              type="text"
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
              placeholder="Enter room name"
              aria-label="Room Name"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150 ease-in-out"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out shadow-sm"
          >
            Join Chat
          </button>
        </form>

        <p className="text-xs text-slate-500 text-center mt-4">
          Messages are not stored. Enter a room name to join or create it.
        </p>
      </div>
    </div>
  );
}

export default LandingPage;