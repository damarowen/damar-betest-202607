# Damar Backend Betest

Technical assessment project: full-stack User Management CRUD application.

## Project Structure

```text
damar-backend-betest/
├── backend/        # NestJS + MongoDB + Redis microservice
├── frontend/       # Vite + React + Redux (Thunk + Saga)
├── docs/           # Documentation (API, Indexing)
├── docker-compose.yml
└── README.md
```

## Naming Convention

| Component | Name |
|-----------|------|
| Git Repo | `damar-backend-betest.git` |
| Microservice | `ms-damar-backend-betest` |
| Database | `db_damar_backend_betest` |
| Redis | `redis_damar_backend_betest` |
| Frontend Container | `damar-backend-betest-frontend` |

## Backend

See [backend README](./backend/README.md)

## Frontend

See [frontend README](./frontend/README.md)

## Running Locally with Docker

```bash
# Start all services
docker-compose up --build

# Backend API: http://localhost:3000/api
# Swagger Docs: http://localhost:3000/api/docs
# Frontend: http://localhost:8080
# MongoDB: localhost:27017
# Redis: localhost:6379
```

## Running Locally (Development)

1. Start MongoDB and Redis
2. Copy `backend/.env.example` to `backend/.env`
3. Run backend:
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```
4. Run frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Tech Stack

- **Backend:** NestJS, MongoDB, Mongoose, Redis, JWT, Swagger
- **Frontend:** Vite, React, Redux Toolkit, Redux Thunk, Redux Saga, Tailwind CSS
- **DevOps:** Docker, Docker Compose
