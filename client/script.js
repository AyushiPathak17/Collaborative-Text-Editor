// client/script.js
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.30.1/min/vs' }});
require(['vs/editor/editor.main'], function() {
  // Initialize Monaco Editor here
  var editor = monaco.editor.create(document.getElementById('editor'), {
    value: 'Hello, world!',
    language: 'javascript'
  });
});


editor.getModel().onDidChangeContent(() => {
  const text = editor.getValue();
  socket.emit('text-update', text); // Send text updates to server
});

socket.on('text-update', (data) => {
  editor.setValue(data); // Update editor with received text updates
});

let decorations = [];

socket.on('highlight-update', (highlightData) => {
  // Clear previous decorations
  decorations.forEach((decoration) => decoration.dispose());

  // Apply new decorations
  decorations = editor.deltaDecorations([], [{
    range: highlightData.range,
    options: { inlineClassName: 'highlighted-text' },
  }]);
});

// Simulate cursor position update (replace this with actual cursor synchronization logic)
setInterval(() => {
  const cursorPosition = editor.getPosition();
  socket.emit('cursor-update', cursorPosition);
}, 1000);

socket.on('cursor-update', (cursorData) => {
  // Update cursor positions based on received data
  const position = cursorData;

  // Create a unique ID for each cursor based on user information (replace 'userId' with actual user ID)
  const cursorId = `cursor-${cursorData.userId}`;

  // Remove existing cursor if present
  const existingCursor = document.getElementById(cursorId);
  if (existingCursor) {
    existingCursor.remove();
  }

  // Create and append new cursor element
  const cursorElement = document.createElement('div');
  cursorElement.id = cursorId;
  cursorElement.classList.add('cursor');
  cursorElement.style.top = `${position.lineNumber * editor.getOption(monaco.editor.EditorOption.lineHeight)}px`;
  cursorElement.style.left = `${position.column * editor.getOption(monaco.editor.EditorOption.fontInfo.typicalFullwidthCharacterWidth)}px`;
  cursorElement.innerHTML = '&#x25B6;'; // Use any cursor symbol/icon you prefer
  document.getElementById('editor').appendChild(cursorElement);
});

// User Authentication
const accessToken = localStorage.getItem('accessToken');

if (accessToken) {
  socket.auth = { token: accessToken };
  socket.connect();
} else {
  // Redirect to login page or handle authentication flow
  console.error('Access token not found. Redirecting to login page...');
  window.location.href = '/login';
}

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
});