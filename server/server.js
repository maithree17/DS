const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Serve static files from React build directory
app.use(express.static(path.join(__dirname, '../client/dist')));

// Simple status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    message: 'Distributed System Simulator Backend is running.',
    timestamp: new Date().toISOString()
  });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
