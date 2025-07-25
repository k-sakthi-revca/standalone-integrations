require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

// Import routes
const securityScorecardsRoutes = require('./routes/securityscorecards');
const merakiRoutes = require('./routes/meraki');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Apply express.raw() *only* to the webhook route
app.post('/api/meraki/webhook', express.raw({ type: '*/*' }), (req, res) => {
  const SHARED_SECRET = "193296e25da6f13d794296adf525b0b49e42f664"; // ✅ move to .env in production
  const rawBody = req.body.toString(); // raw buffer to string
  // Parse it into an object
  const parsedBody = JSON.parse(rawBody);

  // Now access sharedSecret
  const sharedSecret = parsedBody.sharedSecret;

  if (sharedSecret === SHARED_SECRET) {
    console.log("✅ Signature verified.");
    res.sendStatus(200);
  } else {
    console.log("❌ Signature mismatch.");
    res.sendStatus(403);
  }
});
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  next();
});

// Test endpoint to check if server is reachable
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ message: 'Server is reachable' });
});

// API Routes
app.use('/api/securityscorecards', securityScorecardsRoutes);
app.use('/api/meraki', merakiRoutes);


// Check if the React build directory exists
const reactBuildPath = path.join(__dirname, '..', 'integrations-fe', 'build');
const fs = require('fs');

if (fs.existsSync(reactBuildPath)) {
  // Serve static files from the React app build directory
  app.use(express.static(reactBuildPath));

  // Default route - send the React app
  app.get('/', (req, res) => {
    res.sendFile(path.join(reactBuildPath, 'index.html'));
  });

  // Handle React routing, return all requests to React app
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(reactBuildPath, 'index.html'));
  });
} else {
  // If React build doesn't exist, serve a simple message
  app.get('/', (req, res) => {
    res.send(`
      <h1>API Server Running</h1>
      <p>The React app build is not available. Please build the React app first:</p>
      <pre>
        cd integrations-fe
        npm install
        npm run build
      </pre>
      <p>Or you can run the React development server:</p>
      <pre>
        cd integrations-fe
        npm install
        npm start
      </pre>
      <p>API endpoints are available at:</p>
      <ul>
        <li><a href="/api/securityscorecards/portfolios?mock=true">/api/securityscorecards/portfolios</a></li>
      </ul>
    `);
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the application at http://localhost:${PORT}`);
});
