# Damar Backend Betest

Full-stack User Management CRUD application — technical assessment project.

## Project Structure

```text
damar-backend-betest/
├── backend/                    # NestJS + MongoDB + Redis API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/           # JWT authentication
│   │   │   ├── user-info/      # User CRUD + cache + enrichment
│   │   │   ├── account-login/  # Login credentials management
│   │   │   └── redis/          # Redis cache service
│   │   ├── common/             # Guards, decorators, filters, base repository
│   │   ├── config/             # Database + JWT config
│   │   ├── main.ts             # Bootstrap
│   │   └── seed.ts             # Seed script
│   └── Dockerfile
│
├── frontend/                   # Vite + React 18 + Redux
│   ├── src/
│   │   ├── pages/              # Login, UserList, UserDetail, UserForm
│   │   ├── components/         # Modal, OfflineBanner, MainLayout
│   │   ├── redux/              # Store, slices, sagas
│   │   ├── api/                # Axios instance + interceptors
│   │   ├── services/           # CacheService (localStorage)
│   │   ├── hooks/              # useOnlineStatus
│   │   └── types/              # TypeScript interfaces
│   ├── nginx.conf              # SPA routing + API proxy
│   └── Dockerfile
│
├── docs/                       # API + Indexing documentation
├── docker-compose.yml          # Local development
├── docker-compose.dokploy.yml  # Dokploy deployment
├── run-local.sh                # One-command local runner
├── RUN.md                      # Deployment guide
└── README.md
```

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | NestJS 10, TypeScript, MongoDB (Mongoose), Redis (ioredis), JWT (Passport) |
| Frontend | Vite 5, React 18, Redux Toolkit, Redux Saga, Tailwind CSS, React Hook Form |
| DevOps | Docker, Docker Compose, Dokploy, Nginx Proxy Manager |

## Quick Start

```bash
# 1. Start databases (Docker)
docker-compose up -d mongo redis

# 2. Backend
cd backend && cp .env.example .env && npm install && npm run seed && npm run start:dev

# 3. Frontend (terminal baru)
cd frontend && cp .env.example .env && npm install && npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api/v1 |
| Swagger UI | http://localhost:3000/api/docs |

## Default Login

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| User | `user` | `user123` |

## Docker Compose (semua service)

```bash
docker-compose up --build
# Seed: docker exec ms-damar-backend-betest node dist/seed.js
```

## Deploy ke Dokploy

Lihat [RUN.md](./RUN.md) untuk panduan lengkap.

## Documentation

| Document | Description |
|---|---|
| [Backend README](./backend/README.md) | API architecture, database schema, RBAC, caching strategy |
| [Frontend README](./frontend/README.md) | State management, caching, routes, components, troubleshooting |
| [API Docs](./docs/API.md) | All endpoints, request/response format, auth flow |
| [Indexing & Constraints](./docs/INDEXING.md) | MongoDB indexes, unique constraints, migration notes |
| [RUN.md](./RUN.md) | Local dev, Docker, Dokploy deployment guide |
