const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load the proto file
const PROTO_PATH = path.join(__dirname, '../proto/user_service.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const userServiceProto = grpc.loadPackageDefinition(packageDefinition).userservice;

// In-memory data store (replace with database in production)
let users = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    created_at: Date.now(),
    updated_at: Date.now(),
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    created_at: Date.now(),
    updated_at: Date.now(),
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'moderator',
    created_at: Date.now() - 86400000,
    updated_at: Date.now() - 86400000,
  },
];

let nextId = 4;

// Utility functions
const findUserById = (id) => users.find(user => user.id === parseInt(id));
const findUserByEmail = (email) => users.find(user => user.email === email);

// gRPC service implementations
const userService = {
  // Health check method
  healthCheck: (call, callback) => {
    console.log('Health check requested');
    callback(null, {
      status: 'SERVING',
      message: 'User service is healthy',
      timestamp: Date.now(),
    });
  },

  // Get user by ID
  getUser: (call, callback) => {
    const { id } = call.request;
    console.log(`gRPC GetUser called with ID: ${id}`);
    
    const user = findUserById(id);
    
    if (user) {
      callback(null, {
        user,
        success: true,
        message: 'User retrieved successfully',
        error_code: '',
      });
    } else {
      callback(null, {
        user: null,
        success: false,
        message: 'User not found',
        error_code: 'USER_NOT_FOUND',
      });
    }
  },

  // Create new user
  createUser: (call, callback) => {
    const { name, email, role } = call.request;
    console.log(`gRPC CreateUser called with: ${JSON.stringify({ name, email, role })}`);
    
    // Validation
    if (!name || !email) {
      callback(null, {
        user: null,
        success: false,
        message: 'Name and email are required',
        error_code: 'VALIDATION_ERROR',
      });
      return;
    }

    // Check if email already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      callback(null, {
        user: null,
        success: false,
        message: 'Email already exists',
        error_code: 'EMAIL_EXISTS',
      });
      return;
    }

    const newUser = {
      id: nextId++,
      name,
      email,
      role: role || 'user',
      created_at: Date.now(),
      updated_at: Date.now(),
    };

    users.push(newUser);

    callback(null, {
      user: newUser,
      success: true,
      message: 'User created successfully',
      error_code: '',
    });
  },

  // List users with pagination and search
  listUsers: (call, callback) => {
    const { page = 1, limit = 10, search = '' } = call.request;
    console.log(`gRPC ListUsers called with: page=${page}, limit=${limit}, search="${search}"`);

    let filteredUsers = users;

    // Apply search filter
    if (search) {
      filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.role.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    callback(null, {
      users: paginatedUsers,
      total: filteredUsers.length,
      page: parseInt(page),
      limit: parseInt(limit),
      success: true,
      message: `Retrieved ${paginatedUsers.length} users`,
    });
  },

  // Update existing user
  updateUser: (call, callback) => {
    const { id, name, email, role } = call.request;
    console.log(`gRPC UpdateUser called with ID: ${id}`);

    const userIndex = users.findIndex(user => user.id === parseInt(id));

    if (userIndex === -1) {
      callback(null, {
        user: null,
        success: false,
        message: 'User not found',
        error_code: 'USER_NOT_FOUND',
      });
      return;
    }

    // Check if email already exists for another user
    if (email) {
      const existingUser = users.find(user => user.email === email && user.id !== parseInt(id));
      if (existingUser) {
        callback(null, {
          user: null,
          success: false,
          message: 'Email already exists',
          error_code: 'EMAIL_EXISTS',
        });
        return;
      }
    }

    // Update user
    const updatedUser = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      email: email || users[userIndex].email,
      role: role || users[userIndex].role,
      updated_at: Date.now(),
    };

    users[userIndex] = updatedUser;

    callback(null, {
      user: updatedUser,
      success: true,
      message: 'User updated successfully',
      error_code: '',
    });
  },

  // Delete user by ID
  deleteUser: (call, callback) => {
    const { id } = call.request;
    console.log(`gRPC DeleteUser called with ID: ${id}`);

    const userIndex = users.findIndex(user => user.id === parseInt(id));

    if (userIndex === -1) {
      callback(null, {
        success: false,
        message: 'User not found',
        error_code: 'USER_NOT_FOUND',
      });
      return;
    }

    users.splice(userIndex, 1);

    callback(null, {
      success: true,
      message: 'User deleted successfully',
      error_code: '',
    });
  },
};

// Create and start the gRPC server
function startServer() {
  const server = new grpc.Server();
  
  // Add the UserService to the server
  server.addService(userServiceProto.UserService.service, userService);
  
  const port = process.env.GRPC_PORT || '50051';
  const host = process.env.GRPC_HOST || '0.0.0.0';
  
  server.bindAsync(
    `${host}:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error('Failed to start gRPC server:', error);
        process.exit(1);
      }
      
      console.log('🚀 gRPC Server started successfully!');
      console.log(`📡 Server running on ${host}:${port}`);
      console.log(`🔧 Protocol: gRPC with Protocol Buffers`);
      console.log(`📊 Initial users loaded: ${users.length}`);
      console.log('🎯 Available services: UserService');
      
      server.start();
    }
  );

  return server;
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT. Graceful shutdown...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM. Graceful shutdown...');
  process.exit(0);
});

// Start the server
const server = startServer();

module.exports = { userService, server };