# Damar Backend Betest - Backend

NestJS microservice for User Management technical assessment.

## Requirements

- Node.js 20+
- MongoDB
- Redis

## Setup

```bash
cp .env.example .env
npm install
npm run start:dev
```

## API Documentation

Swagger UI available at: `http://localhost:3000/api/docs`

## Available Scripts

- `npm run start:dev` - Development mode
- `npm run build` - Build for production
- `npm run start:prod` - Run production build
- `npm test` - Run unit tests
- `npm run test:cov` - Run tests with coverage

## Environment Variables

| Variable | Description |
|----------|-------------|
| PORT | Server port (default: 3000) |
| MONGODB_URI | MongoDB connection string |
| JWT_SECRET | Secret key for JWT |
| JWT_EXPIRES_IN | JWT expiration time |
| REDIS_HOST | Redis host |
| REDIS_PORT | Redis port |
| CORS_ORIGIN | Allowed CORS origin |
