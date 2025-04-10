import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ChatRoom from './pages/ChatRoom';
import 'nes.css/css/nes.min.css';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/:roomId" element={<ChatRoom />} />
      </Routes>
    </Router>
  );
}

export default App;