// proxy-server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000', // React app URL
  credentials: true,
}));

// Proxy gRPC-Web requests to gRPC server
app.use('/userservice.UserService', createProxyMiddleware({
  target: 'http://localhost:50051',
  changeOrigin: true,
  ws: true,
  logLevel: 'debug',
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'gRPC-Web proxy is running' });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`gRPC-Web proxy server running on port ${PORT}`);
  console.log(`Proxying requests to gRPC server on port 50051`);
});

module.exports = app;