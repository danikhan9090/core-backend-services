# Backend Services System

A comprehensive backend system built with Node.js and Express.js, featuring multiple microservices for various functionalities.

## Services Overview

1. **Authentication Service**
   - JWT-based authentication
   - Role-based access control
   - User management

2. **Task Management Service**
   - CRUD operations for tasks
   - User-specific task management

3. **URL Shortener Service**
   - URL shortening functionality
   - Visit tracking
   - Expiry management

4. **Blog Service**
   - Blog post management
   - Comment system
   - Pagination support

5. **AI Services**
   - Text summarization
   - Logic simulator
   - Image generation (design)

6. **Utility Services**
   - Webhook catcher
   - Analytics tracker
   - Rate-limited quote generator
   - Stock price notifier
   - Report generator

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Redis
- Docker (optional)

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd backend-services
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/backend-services

   # Redis
   REDIS_URL=redis://localhost:6379

   # JWT
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=24h

   # Service Ports
   GATEWAY_PORT=3000
   AUTH_PORT=3001
   TASK_PORT=3002
   URL_PORT=3003
   BLOG_PORT=3004
   ```

4. Start the services:
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Documentation

API documentation is available via Swagger UI at:
- Gateway: http://localhost:3000/api-docs
- Auth Service: http://localhost:3001/api-docs
- Task Service: http://localhost:3002/api-docs
- URL Service: http://localhost:3003/api-docs
- Blog Service: http://localhost:3004/api-docs

## Testing

Run tests for all services:
```bash
npm test
```

## Project Structure

```
backend-services/
├── services/
│   ├── gateway/          # API Gateway
│   ├── auth/            # Authentication Service
│   ├── task/            # Task Management Service
│   ├── url-shortener/   # URL Shortener Service
│   ├── blog/            # Blog Service
│   └── shared/          # Shared utilities and types
├── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT 