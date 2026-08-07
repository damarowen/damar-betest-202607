# Handoff Document: Damar Backend Betest

**Date:** 2026-08-08
**Project:** damar-backend-betest (Technical Assessment)
**GitHub:** https://github.com/damarowen/damar-betest-202607
**Local Path:** `/Users/macbookair/Desktop/damar-backend-betest`

---

## What This Project Is

Full-stack User Management CRUD application for a technical assessment.

- **Backend:** NestJS + MongoDB + Redis + JWT + Swagger
- **Frontend:** Vite + React 18 + Redux Toolkit + Redux Thunk + Redux Saga + Tailwind CSS
- **DevOps:** Docker + Docker Compose, local shell script runner

---

## Current State

### Git History (3 commits)
```
a49fe9a fix: resolve 6 critical bugs from code review
86c33f0 docs: add running guide
dea1517 feat: initial technical assessment implementation
```

### Uncommitted Changes (28 files, +687/-57)
**NOT committed yet.** User explicitly asked not to commit without permission.

Changes include:
- Role-based access control (backend + frontend)
- `@Public()` decorator for login endpoint
- `@Roles()` decorator + `RolesGuard` for admin-only endpoints
- Seed script (`npm run seed`) for initial user data
- Frontend: role stored in Redux, Delete button hidden for non-admin, role dropdown restricted
- Cache key per-page for localStorage offline cache
- `delPattern()` for cache invalidation
- `evictOldest()` for localStorage quota handling
- `React.forwardRef` fix for form validation
- Modal close on Escape/backdrop click
- API base URL fixed to `/api/v1`
- `run-local.sh` script for one-command local run
- Documentation updates (RUN.md)

### Test Results
- **Backend:** 18 tests passing (3 suites)
- **Frontend:** 25 tests passing (4 suites)
- **Build:** Both backend (`nest build`) and frontend (`vite build`) succeed

### Running Services
- Backend running on `http://localhost:3000` (watch mode, PID varies)
- Frontend running on `http://localhost:5173` (Vite dev server)
- MongoDB running on `localhost:27017`
- Redis running on `localhost:6379`

### Seed Data
Created via `npm run seed` in backend directory:
| Role | Username | Password |
|------|----------|----------|
| admin | admin | admin123 |
| user | user | user123 |

---

## Architecture

### Naming Convention
| Component | Name |
|-----------|------|
| Git Repo | `damar-backend-betest.git` |
| Microservice | `ms-damar-backend-betest` |
| Database | `db_damar_backend_betest` |
| Redis | `redis_damar_backend_betest` |
| Frontend Container | `damar-backend-betest-frontend` |

**RESTRICTED WORDS:** SMBC, SMBCI, JENIUS, BTPN — must NOT appear anywhere.

### Backend Structure (`backend/`)
```
src/
├── common/
│   ├── decorators/   (public.decorator.ts, roles.decorator.ts)
│   ├── filters/      (http-exception.filter.ts)
│   ├── guards/       (jwt-auth.guard.ts, roles.guard.ts)
│   └── repositories/ (base.repository.ts)
├── config/           (database.config.ts, jwt.config.ts)
├── modules/
│   ├── auth/         (login, JWT strategy)
│   ├── user-info/    (CRUD + custom reads + Redis cache)
│   ├── account-login/(CRUD + inactive query)
│   └── redis/        (Redis module, service, constants)
├── seed.ts
└── main.ts
```

**Key Design Decisions:**
- `JwtAuthGuard` and `RolesGuard` are registered as **global guards** via `APP_GUARD`
- `@Public()` decorator skips JWT auth (used for `/api/v1/auth/login`)
- `@Roles('admin')` on delete endpoints, `@Roles('admin', 'user')` on read/create
- Redis cache key is per-page+filter: `users:list:p1:l10:fullName:all:s`
- `select: false` on password field in AccountLogin schema
- API versioning: `/api/v1/...`

### Frontend Structure (`frontend/`)
```
src/
├── api/axios.ts        (base URL: /api/v1)
├── components/
│   ├── common/         (Modal, OfflineBanner)
│   └── layout/         (MainLayout)
├── hooks/              (useOnlineStatus)
├── pages/              (LoginPage, UserListPage, UserDetailPage, UserFormPage, NotFoundPage)
├── redux/
│   ├── slices/         (auth.slice, userInfo.slice)
│   ├── sagas/          (userInfo.saga)
│   └── store.ts
├── services/           (cache.service.ts)
└── types/              (user-info.ts)
```

**Key Design Decisions:**
- Redux Toolkit + Thunk for auth, Redux Saga for userInfo CRUD
- localStorage cache for offline read (5min TTL, per-page keys)
- `evictOldest()` auto-cleans 1/3 of cache when localStorage is full
- `React.forwardRef` on FormInput for React Hook Form validation
- Role decoded from JWT token and stored in Redux auth state

---

## Role-Based Access Control

| Endpoint | Admin | User |
|----------|-------|------|
| GET /api/v1/user-infos | ✅ | ✅ |
| GET /api/v1/user-infos/:userId | ✅ | ✅ |
| POST /api/v1/user-infos | ✅ (any role) | ✅ (role=user only) |
| PUT /api/v1/user-infos/:userId | ✅ | ✅ (cannot set admin) |
| DELETE /api/v1/user-infos/:userId | ✅ | ❌ 403 |
| GET /api/v1/account-logins | ✅ | ✅ |
| POST/PUT/DELETE account-logins | ✅ | ❌ 403 |
| POST /api/v1/auth/login | Public | Public |

---

## How to Run

### Quick Start (local, no Docker)
```bash
cd /Users/macbookair/Desktop/damar-backend-betest
./run-local.sh
```
This auto-checks prereqs, starts MongoDB/Redis, installs deps, seeds data, and starts backend + frontend.

### Manual
```bash
# Backend (terminal 1)
cd backend && cp .env.example .env && npm install && npm run seed && npm run start:dev

# Frontend (terminal 2)
cd frontend && cp .env.example .env && npm install && npm run dev
```

### Docker Compose
```bash
docker-compose up --build
# Then seed: docker exec ms-damar-backend-betest npx ts-node src/seed.ts
```

### URLs
| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api/v1 |
| Swagger UI | http://localhost:3000/api/docs |
| MongoDB | localhost:27017 |
| Redis | localhost:6379 |

---

## What Remains To Be Done

1. **Commit the 28 uncommitted files** — user has NOT given permission yet. Ask first.
2. **Push to GitHub** after commit
3. **Deploy to VPS** — user has their own VPS, needs nginx config for frontend static files
4. **Potential improvements mentioned but not requested:**
   - Migrate `loginThunk` to saga for consistency (currently thunks for auth, sagas for userInfo)
   - Add `isAxiosError` type guard instead of `error: any` in sagas
   - Sort field validation with `@IsIn()` allowlist in DTOs
   - e2e tests for full API flow

---

## Suggested Skills

- `code-review` — review the uncommitted changes before committing
- `frontend-design` — if UI polish is needed
- `tdd` — if adding more tests
- `diagnosing-bugs` — if any runtime issues appear

---

## Key Files Reference

- Backend entry: `backend/src/main.ts`
- Backend app module: `backend/src/app.module.ts`
- Auth guard: `backend/src/common/guards/jwt-auth.guard.ts`
- Roles guard: `backend/src/common/guards/roles.guard.ts`
- User info controller: `backend/src/modules/user-info/user-info.controller.ts`
- User info service: `backend/src/modules/user-info/user-info.service.ts`
- Seed script: `backend/src seed.ts`
- Frontend entry: `frontend/src/main.tsx`
- Redux store: `frontend/src/redux/store.ts`
- Auth slice: `frontend/src/redux/slices/auth.slice.ts`
- User info saga: `frontend/src/redux/sagas/userInfo.saga.ts`
- Cache service: `frontend/src/services/cache.service.ts`
- Form page: `frontend/src/pages/UserFormPage.tsx`
- List page: `frontend/src/pages/UserListPage.tsx`
- Docker compose: `docker-compose.yml`
- Run script: `run-local.sh`
