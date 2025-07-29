// server.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load the proto file
const PROTO_PATH = path.join(__dirname, 'user_service.proto');
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
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    created_at: Date.now(),
  },
];

let nextId = 3;

// gRPC service implementations
const userService = {
  getUser: (call, callback) => {
    const { id } = call.request;
    const user = users.find(u => u.id === id);
    
    if (user) {
      callback(null, {
        user,
        success: true,
        message: 'User retrieved successfully',
      });
    } else {
      callback(null, {
        user: null,
        success: false,
        message: 'User not found',
      });
    }
  },

  createUser: (call, callback) => {
    const { name, email, role } = call.request;
    
    // Check if email already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      callback(null, {
        user: null,
        success: false,
        message: 'Email already exists',
      });
      return;
    }

    const newUser = {
      id: nextId++,
      name,
      email,
      role: role || 'user',
      created_at: Date.now(),
    };

    users.push(newUser);

    callback(null, {
      user: newUser,
      success: true,
      message: 'User created successfully',
    });
  },

  listUsers: (call, callback) => {
    const { page = 1, limit = 10 } = call.request;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = users.slice(startIndex, endIndex);

    callback(null, {
      users: paginatedUsers,
      total: users.length,
      success: true,
      message: 'Users retrieved successfully',
    });
  },

  updateUser: (call, callback) => {
    const { id, name, email, role } = call.request;
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      callback(null, {
        user: null,
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Check if email already exists for another user
    const existingUser = users.find(u => u.email === email && u.id !== id);
    if (existingUser) {
      callback(null, {
        user: null,
        success: false,
        message: 'Email already exists',
      });
      return;
    }

    const updatedUser = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      email: email || users[userIndex].email,
      role: role || users[userIndex].role,
    };

    users[userIndex] = updatedUser;

    callback(null, {
      user: updatedUser,
      success: true,
      message: 'User updated successfully',
    });
  },

  deleteUser: (call, callback) => {
    const { id } = call.request;
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      callback(null, {
        success: false,
        message: 'User not found',
      });
      return;
    }

    users.splice(userIndex, 1);

    callback(null, {
      success: true,
      message: 'User deleted successfully',
    });
  },
};

// Create and start the gRPC server
function startServer() {
  const server = new grpc.Server();
  
  server.addService(userServiceProto.UserService.service, userService);
  
  const port = '50051';
  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error('Failed to start server:', error);
        return;
      }
      console.log(`gRPC server running on port ${port}`);
      server.start();
    }
  );
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT. Graceful shutdown...');
  process.exit(0);
});

startServer();

module.exports = { userService };