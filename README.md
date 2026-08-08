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

## Panduan Menjalankan

Lihat file lengkapnya di [RUN.md](./RUN.md). Ringkasnya:

```bash
# Cara 1: Docker Compose (semua service otomatis berjalan)
cd /Users/macbookair/Desktop/damar-backend-betest
docker-compose up --build

# Cara 2: Development manual (perlu MongoDB dan Redis berjalan lokal)
# Terminal 1: Backend
cd backend && cp .env.example .env && npm install && npm run start:dev

# Terminal 2: Frontend
cd frontend && cp .env.example .env && npm install && npm run dev
```

| Service | URL (Docker Compose) |
|---------|----------------------|
| Frontend | http://localhost:8080 |
| Backend API | http://localhost:3000/api |
| Swagger UI | http://localhost:3000/api/docs |

## Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| User | `user` | `user123` |

> Credentials dibuat oleh `npm run seed`. Seed aman dijalankan berulang — jika data sudah ada, akan skip otomatis.

## Tech Stack

- **Backend:** NestJS, MongoDB, Mongoose, Redis, JWT, Swagger
- **Frontend:** Vite, React, Redux Toolkit, Redux Thunk, Redux Saga, Tailwind CSS
- **DevOps:** Docker, Docker Compose
