# URL Shortener Service

A robust URL shortener service built with Node.js, Express, and TypeScript.

## Features

- URL shortening with custom codes
- URL expiration
- Click tracking
- User authentication
- Rate limiting
- Request validation
- Structured logging
- Error handling
- Pagination and sorting

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   # Server Configuration
   PORT=3003
   NODE_ENV=development
   LOG_LEVEL=info

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/url-shortener

   # JWT Configuration
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRES_IN=7d

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX=100

   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000
   ```

## Development

Start the development server:
```bash
npm run dev
```

## Building

Build the project:
```bash
npm run build
```

## Production

Start the production server:
```bash
npm start
```

## API Endpoints

### Public Routes

- `GET /:shortCode` - Redirect to original URL

### Protected Routes

- `POST /` - Create short URL
  - Body: `{ originalUrl: string, expiresIn?: number, customCode?: string }`

- `GET /` - List URLs
  - Query: `page`, `limit`, `sortBy`, `sortOrder`

- `PATCH /:shortCode` - Update URL
  - Body: `{ originalUrl?: string, expiresIn?: number }`

- `DELETE /:shortCode` - Delete URL

## Error Handling

The service uses custom error classes for different types of errors:

- `BadRequestError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `ValidationError` (400)
- `ConflictError` (409)
- `DatabaseError` (500)
- `ServiceUnavailableError` (503)

## Logging

The service uses Winston for logging with the following features:

- Console logging in development
- File rotation in production
- Separate error logs
- Request logging with Morgan
- Uncaught exception handling

## Security

- JWT authentication
- Rate limiting
- CORS configuration
- Helmet security headers
- Input validation with Zod

## Testing

Run tests:
```bash
npm test
```

## License

MIT 