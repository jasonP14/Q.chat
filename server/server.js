require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { handleSocketConnections } = require('./socketHandler');

const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS configuration
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL /* || 'http://localhost:5173' */,
    methods: ['GET', 'POST']
  }
});

// Handle socket connections
handleSocketConnections(io);

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} and serving ${process.env.CLIENT_URL}`);
});