# gRPC Microservice Application Setup Guide

This project demonstrates a complete microservice architecture using gRPC for communication between a React frontend and Node.js backend.

## Architecture Overview

```
┌─────────────────┐    gRPC-Web     ┌─────────────────┐    gRPC    ┌─────────────────┐
│   React Client  │ ───────────────► │  Proxy Server   │ ──────────► │  gRPC Server    │
│   (Frontend)    │                  │  (Express.js)   │             │  (Node.js)      │
└─────────────────┘                  └─────────────────┘             └─────────────────┘
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Protocol Buffers compiler (protoc)

## Project Structure

```
grpc-microservice-app/
├── server/
│   ├── user_service.proto
│   ├── server.js
│   ├── proxy-server.js
│   └── package.json
└── client/
    ├── src/
    │   └── App.js
    ├── package.json
    └── public/
```

## Installation Steps

### 1. Install Protocol Buffers Compiler

**macOS:**
```bash
brew install protobuf
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install protobuf-compiler
```

**Windows:**
Download from [Protocol Buffers releases](https://github.com/protocolbuffers/protobuf/releases)

### 2. Setup Server

```bash
# Create server directory
mkdir grpc-microservice-app
cd grpc-microservice-app
mkdir server
cd server

# Create the proto file (copy from user_service.proto artifact)
# Create server.js (copy from server artifact)
# Create proxy-server.js (copy from proxy server artifact)
# Create package.json (copy from server package.json artifact)

# Install dependencies
npm install

# Optional: Install nodemon for development
npm install -g nodemon
```

### 3. Setup Client

```bash
# Go back to root directory
cd ..
mkdir client
cd client

# Initialize React app
npx create-react-app . --template typescript
# Or use the provided package.json

# Install additional dependencies
npm install grpc-web google-protobuf

# Install Tailwind CSS for styling
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Replace src/App.js with the React client artifact code
```

### 4. Configure Tailwind CSS

Create or update `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Add to `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Running the Application

### 1. Start the gRPC Server

```bash
cd server
npm start
# Server will run on port 50051
```

### 2. Start the Proxy Server (in a new terminal)

```bash
cd server
node proxy-server.js
# Proxy will run on port 8080
```

### 3. Start the React Client (in a new terminal)

```bash
cd client
npm start
# Client will run on port 3000
```

## Usage

1. Open your browser to `http://localhost:3000`
2. The application provides a user management interface with:
   - Create new users
   - View all users
   - Edit existing users
   - Delete users
   - Search functionality

## gRPC Service Methods

The application demonstrates the following gRPC methods:

- `GetUser(GetUserRequest) → GetUserResponse`
- `CreateUser(CreateUserRequest) → CreateUserResponse`
- `ListUsers(ListUsersRequest) → ListUsersResponse`
- `UpdateUser(UpdateUserRequest) → UpdateUserResponse`
- `DeleteUser(DeleteUserRequest) → DeleteUserResponse`

## Key Features

### Protocol Buffers
- Strongly typed message definitions
- Efficient binary serialization
- Cross-language compatibility

### gRPC Benefits
- HTTP/2 based transport
- Bidirectional streaming support
- Built-in authentication and load balancing
- Code generation for multiple languages

### Microservice Architecture
- Service isolation
- Independent deployability
- Technology diversity
- Fault isolation

## Development Notes

### For Production Use:

1. **Database Integration**: Replace in-memory storage with a proper database
2. **Authentication**: Implement JWT or OAuth
3. **Error Handling**: Add comprehensive error handling and logging
4. **Testing**: Add unit and integration tests
5. **Containerization**: Use Docker for deployment
6. **Service Discovery**: Implement service registry
7. **Load Balancing**: Add load balancer for multiple service instances

### gRPC-Web Limitations:

- Requires proxy server for browser compatibility
- No server-side streaming in browsers
- Limited browser support for HTTP/2

## Troubleshooting

### Common Issues:

1. **Port conflicts**: Ensure ports 3000, 8080, and 50051 are available
2. **CORS errors**: Check proxy server configuration
3. **Proto compilation**: Verify protoc installation and PATH configuration

### Debugging:

```bash
# Check if gRPC server is running
telnet localhost 50051

# Check proxy server
curl http://localhost:8080/health

# Check React app
curl http://localhost:3000
```

## Extensions

Consider adding these features to enhance the application:

1. **Real-time updates** using gRPC streaming
2. **Authentication service** as separate microservice
3. **Notification service** for user events
4. **API Gateway** pattern implementation
5. **Service mesh** integration (Istio, Linkerd)
6. **Metrics and monitoring** with Prometheus
7. **Distributed tracing** with Jaeger

## Resources

- [gRPC Documentation](https://grpc.io/docs/)
- [Protocol Buffers Guide](https://developers.google.com/protocol-buffers)
- [gRPC-Web Documentation](https://github.com/grpc/grpc-web)
- [Microservices Patterns](https://microservices.io/patterns/)

This application serves as a foundation for building production-ready microservice architectures using gRPC technology.