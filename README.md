# 🚀 gRPC Microservice Quick Setup & Overview

## 📋 Project Overview

A **production-ready gRPC microservice stack**:
- **Backend**: Node.js gRPC server (Protocol Buffers)
- **Proxy**: Express.js HTTP-to-gRPC bridge
- **Frontend**: React.js client

## 🏗️ File Structure

```
grpc-microservice/
├── server/      # gRPC backend & proxy
├── client/      # React frontend
├── docker-compose.yml
└── README.md
```

## ⚡ How to run

```bash
git clone https://github.com/pronobkarmoker/gRPC-microservice.git
cd grpc-microservice

# Setup server
cd server && npm install && cd ..

# Setup client
cd client && npm install && cd ..
```

### Start Services

**npm (3 terminals):**
```bash
cd server && npm start      # gRPC server (50051)
cd server && npm run proxy  # Proxy server (8080)
cd client && npm start      # React client (3000)
```

**Docker (single command):**
```bash
docker-compose up --build
```

## 🛠️ Prerequisites

- Node.js (v16+), npm (v8+), Git
- Docker & Docker Compose (optional)

---

**Access:**  
- Frontend: http://localhost:3000  
- Proxy API: http://localhost:8080/health  
- gRPC: localhost:50051

---

## 👤 Author

**Pronob Karmoker**  
[GitHub](https://github.com/pronobkarmoker)
