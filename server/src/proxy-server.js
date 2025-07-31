const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load the proto file for client connection
const PROTO_PATH = path.join(__dirname, '../proto/user_service.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const userServiceProto = grpc.loadPackageDefinition(packageDefinition).userservice;

// Create gRPC client to connect to the gRPC server
const client = new userServiceProto.UserService(
  process.env.GRPC_SERVER_URL || 'localhost:50051',
  grpc.credentials.createInsecure()
);

const app = express();

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Utility function to promisify gRPC calls
const grpcCall = (method, request) => {
  return new Promise((resolve, reject) => {
    client[method](request, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const response = await grpcCall('healthCheck', { service: 'UserService' });
    res.json({
      status: 'OK',
      message: 'Proxy server is running',
      grpc_service: response,
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      message: 'gRPC service unavailable',
      error: error.message,
      timestamp: Date.now()
    });
  }
});

// REST API endpoints that proxy to gRPC

// GET /api/users - List all users
app.get('/api/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    console.log(`REST->gRPC: ListUsers(page=${page}, limit=${limit}, search="${search}")`);
    
    const response = await grpcCall('listUsers', {
      page: parseInt(page),
      limit: parseInt(limit),
      search: search
    });

    res.json({
      success: response.success,
      data: {
        users: response.users,
        pagination: {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: Math.ceil(response.total / response.limit)
        }
      },
      message: response.message
    });
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/users/:id - Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`REST->gRPC: GetUser(id=${id})`);
    
    const response = await grpcCall('getUser', { id: parseInt(id) });

    if (response.success) {
      res.json({
        success: true,
        data: response.user,
        message: response.message
      });
    } else {
      res.status(404).json({
        success: false,
        message: response.message,
        error_code: response.error_code
      });
    }
  } catch (error) {
    console.error('Error in GET /api/users/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/users - Create new user
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    
    console.log(`REST->gRPC: CreateUser(${JSON.stringify({ name, email, role })})`);
    
    const response = await grpcCall('createUser', { name, email, role });

    if (response.success) {
      res.status(201).json({
        success: true,
        data: response.user,
        message: response.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: response.message,
        error_code: response.error_code
      });
    }
  } catch (error) {
    console.error('Error in POST /api/users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PUT /api/users/:id - Update user
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    
    console.log(`REST->gRPC: UpdateUser(id=${id}, ${JSON.stringify({ name, email, role })})`);
    
    const response = await grpcCall('updateUser', {
      id: parseInt(id),
      name,
      email,
      role
    });

    if (response.success) {
      res.json({
        success: true,
        data: response.user,
        message: response.message
      });
    } else {
      const statusCode = response.error_code === 'USER_NOT_FOUND' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: response.message,
        error_code: response.error_code
      });
    }
  } catch (error) {
    console.error('Error in PUT /api/users/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// DELETE /api/users/:id - Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`REST->gRPC: DeleteUser(id=${id})`);
    
    const response = await grpcCall('deleteUser', { id: parseInt(id) });

    if (response.success) {
      res.json({
        success: true,
        message: response.message
      });
    } else {
      res.status(404).json({
        success: false,
        message: response.message,
        error_code: response.error_code
      });
    }
  } catch (error) {
    console.error('Error in DELETE /api/users/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Start the proxy server
const PORT = process.env.PROXY_PORT || 8080;
const HOST = process.env.PROXY_HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log('🚀 gRPC Proxy Server started successfully!');
  console.log(`🌐 HTTP REST API running on http://${HOST}:${PORT}`);
  console.log(`🔄 Proxying to gRPC server at ${process.env.GRPC_SERVER_URL || 'localhost:50051'}`);
  console.log('📋 Available endpoints:');
  console.log('   GET    /health');
  console.log('   GET    /api/users');
  console.log('   GET    /api/users/:id');
  console.log('   POST   /api/users');
  console.log('   PUT    /api/users/:id');
  console.log('   DELETE /api/users/:id');
});

module.exports = app;