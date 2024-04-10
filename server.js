// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your-secret-key'; // Change this to a secure secret key

app.use(express.static(path.join(__dirname, 'client')));

// Middleware for authenticating JWT tokens
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    req.user = user;
    next();
  });
};

app.post('/login', (req, res) => {
  // In a real application, validate user credentials and generate a JWT token
  const user = { username: 'example_user' };
  const accessToken = jwt.sign(user, JWT_SECRET);
  res.json({ accessToken });
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return next(new Error('Authentication error'));
    }

    socket.user = user;
    next();
  });
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.user.username);

  socket.on('text-update', (data) => {
    const existingText = ''; // Get existing text from database or storage
    const newText = data;

    // Basic conflict resolution: Append new text if no conflicts, handle conflicts as needed
    const updatedText = existingText + newText;

    // Broadcast updated text to all clients
    io.emit('text-update', updatedText);
  });

  socket.on('cursor-update', (cursorData) => {
    socket.broadcast.emit('cursor-update', cursorData); // Broadcast cursor positions
  });

  socket.on('highlight-update', (highlightData) => {
    socket.broadcast.emit('highlight-update', highlightData); // Broadcast text highlight updates
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user.username);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
