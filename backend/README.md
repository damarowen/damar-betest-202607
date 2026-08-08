# Backend - User Management API

REST API untuk manajemen user dengan JWT auth, role-based access control, Redis caching, dan MongoDB.

> **Baru pertama kali buka repo ini?** Langsung ke [Quick Start](#quick-start).

---

## Prerequisites

| Requirement | Version | Check |
|---|---|---|
| Node.js | 20+ | `node -v` |
| npm | 9+ | `npm -v` |
| MongoDB | 6+ | `mongosh` |
| Redis | 7+ | `redis-cli ping` |

---

## Quick Start

```bash
cd backend
cp .env.example .env
npm install
npm run seed        # buat admin + user default
npm run start:dev   # start di http://localhost:3000

# Buka Swagger UI: http://localhost:3000/api/docs
# Login: admin / admin123
```

Atau jalankan semua sekaligus (backend + frontend + database):
```bash
# Dari root project
./run-local.sh
```

---

## Tech Stack

| Technology | Version | Why This Choice |
|---|---|---|
| **NestJS** | 10.x | Enterprise-grade Node.js framework. Modular architecture, dependency injection, decorators-based. Cocok untuk REST API terstruktur. |
| **TypeScript** | 5.x | Type safety, decorators support (penting untuk NestJS), IntelliSense. |
| **MongoDB** | 6+ | Schema-flexible, performant untuk read-heavy workload. `_id` sebagai primary key. |
| **Mongoose** | 8.x | ODM untuk MongoDB. Schema validation, middleware (pre/post hooks), population. |
| **Redis** | 7+ | In-memory cache untuk read-through pattern. TTL-based expiration. |
| **ioredis** | 5.x | Redis client yang lebih reliable dari `redis` package. Support cluster, pipeline. |
| **Passport + JWT** | - | Standard auth library untuk Node.js. JWT stateless, tidak perlu session store. |
| **bcrypt** | 5.x | Password hashing yang aman. Salt rounds = 10. |
| **class-validator** | 0.14 | Dekorator-based validation untuk DTO. Integrasi sempurna dengan NestJS pipes. |
| **Swagger** | 7.x | Auto-generate API docs dari decorators. Interactive testing UI. |

---

## Project Structure

```
backend/
├── .env.example                  # Template environment variables
├── Dockerfile                    # Multi-stage build (Node → production)
├── nest-cli.json                 # NestJS CLI config
├── tsconfig.json                 # TypeScript config
├── package.json
│
└── src/
    ├── main.ts                   # Bootstrap: create app, set global pipes, CORS, versioning, Swagger
    ├── app.module.ts             # Root module: imports semua feature modules
    ├── seed.ts                   # Seed script: buat admin + user default
    │
    ├── config/
    │   ├── database.config.ts    # MongoDB connection factory
    │   └── jwt.config.ts         # JWT options factory (secret, expiresIn)
    │
    ├── common/
    │   ├── decorators/
    │   │   ├── public.decorator.ts   # @Public() — bypass JWT auth
    │   │   └── roles.decorator.ts    # @Roles('admin', 'user') — RBAC
    │   ├── filters/
    │   │   └── http-exception.filter.ts  # Global error formatter
    │   ├── guards/
    │   │   ├── jwt-auth.guard.ts     # JWT guard, skip jika @Public()
    │   │   └── roles.guard.ts        # Role guard, cek @Roles() metadata
    │   └── repositories/
    │       └── base.repository.ts    # Abstract CRUD repository
    │
    └── modules/
        ├── auth/
        │   ├── auth.module.ts
        │   ├── auth.controller.ts    # POST /auth/login (@Public)
        │   ├── auth.service.ts       # validateCredentials, login, JWT signing
        │   ├── strategies/
        │   │   └── jwt.strategy.ts   # Passport JWT strategy
        │   └── dto/
        │       └── login.dto.ts
        │
        ├── user-info/
        │   ├── user-info.module.ts
        │   ├── user-info.controller.ts   # CRUD endpoints
        │   ├── user-info.service.ts      # Business logic + cache + enrichment
        │   ├── user-info.repository.ts   # Data access layer
        │   ├── user-info.service.spec.ts # Unit tests
        │   ├── schemas/
        │   │   └── user-info.schema.ts
        │   └── dto/
        │       ├── create-user-info.dto.ts
        │       ├── update-user-info.dto.ts
        │       └── list-user-info.dto.ts
        │
        ├── account-login/
        │   ├── account-login.module.ts
        │   ├── account-login.controller.ts
        │   ├── account-login.service.ts
        │   ├── account-login.repository.ts
        │   ├── account-login.service.spec.ts
        │   ├── schemas/
        │   │   └── account-login.schema.ts
        │   └── dto/
        │       ├── create-account-login.dto.ts
        │       ├── update-account-login.dto.ts
        │       └── list-account-login.dto.ts
        │
        └── redis/
            ├── redis.module.ts           # Global module
            ├── redis.service.ts          # get/set/del/delPattern
            ├── redis.constants.ts        # Injection token
            └── redis.service.spec.ts
```

---

## Architecture Decisions

### Kenapa Repository Pattern?

Setiap module punya `Repository` yang extends `BaseRepository<T>`. Base repository provides generic CRUD (`findAll`, `findOne`, `create`, `update`, `delete`, `count`). Repository spesifik tambah method custom (`findByAccountNumber`, `existsByUniqueFields`).

**Alasan:**
- Separation of concerns: Service handle business logic, Repository handle data access
- Testable: Repository bisa di-mock tanpa perlu koneksi MongoDB
- Consistent: Semua module pakai pattern yang sama

### Kenapa Global Guards?

`JwtAuthGuard` dan `RolesGuard` di-register sebagai **global guards** via `APP_GUARD` di `app.module.ts`.

```ts
providers: [
  { provide: APP_GUARD, useClass: JwtAuthGuard },
  { provide: APP_GUARD, useClass: RolesGuard },
]
```

**Alasan:**
- Tidak perlu `@UseGuards()` di setiap controller method
- Default: semua endpoint butuh auth
- Exception: `@Public()` decorator bypass auth (untuk login endpoint)
- Lebih DRY, lebih aman (tidak ada yang terlewat)

### Kenapa `@Public()` decorator, bukan exclude pattern?

```ts
// auth.controller.ts
@Public()
@Post('login')
async login(@Body() dto: LoginDto) { ... }
```

**Alasan:**
- Explicit: jelas endpoint mana yang public
- Readable: langsung terlihat di code
- NestJS convention: `SetMetadata` + guard check

### Kenapa Redis Cache untuk UserInfo?

```ts
// user-info.service.ts
async findById(id: string) {
  const cached = await this.redisService.get(key);
  if (cached) return cached;
  
  const user = await this.repository.findOne({ _id: id });
  await this.redisService.set(key, user);  // TTL 5 menit
  return user;
}
```

**Alasan:**
- UserInfo di-read jauh lebih sering daripada di-write
- Cache key per-identifier: `userinfo:id:abc123`, `userinfo:account:100`, `userinfo:registration:REG-1`
- Cache invalidation on write: `invalidateCache()` hapus semua key terkait
- TTL 5 menit: balance antara freshness dan performance

### Kenapa enrich findAll dengan AccountLogin data?

```ts
// user-info.service.ts findAll()
const accounts = await this.accountLoginModel
  .find({ userInfoId: { $in: userObjectIds } })
  .select('userInfoId lastLoginDateTime')
  .lean();
```

**Alasan:**
- Frontend butuh `accountId` (ObjectId account-login) dan `lastLoginDateTime` di tabel list
- Lebih efficient: 1 batch query daripada N+1 queries
- `.lean()`: return plain objects, tidak perlu Mongoose document overhead

### Kenapa auto-create AccountLogin saat create UserInfo?

```ts
// user-info.service.ts create()
const user = await this.userInfoRepository.create(dto);
const hashedPassword = await bcrypt.hash(dto.password, 10);
await this.accountLoginModel.create({
  userName: dto.userName,
  password: hashedPassword,
  userInfoId: user._id,
});
```

**Alasan:**
- User experience: user baru bisa langsung login setelah dibuat
- Atomicity: UserInfo dan AccountLogin selalu sinkron
- Tidak perlu UI terpisah untuk manage AccountLogin

### Kenapa ownership check di update?

```ts
// user-info.service.ts update()
if (callerRole !== 'admin' && callerUserInfoId !== id) {
  throw new ForbiddenException('You can only edit your own data');
}
```

**Alasan:**
- Security: user biasa hanya bisa edit data sendiri
- Admin tetap bisa edit siapapun
- Check di service layer (bukan controller) karena business logic

### Kenapa multi-stage Docker build?

```
Stage 1 (node:20-alpine)  → npm ci + npm run build → dist/
Stage 2 (node:20-alpine)  → copy dist/ + production deps only
```

**Alasan:**
- Image lebih kecil: tidak include devDependencies, source code, node_modules build artifacts
- `npm ci --only=production` hanya install runtime dependencies
- Security: tidak ada source code di production image

---

## State Management Flow

### Auth Flow

```
POST /auth/login { userName, password }
  → AuthService.validateCredentials()
  → AccountLogin.findOne({ userName })
  → bcrypt.compare(password, hashedPassword)
  → AccountLogin.updateOne({ lastLoginDateTime: new Date() })
  → UserInfo.findOne({ _id: account.userInfoId }) → ambil role
  → JWT.sign({ accountLoginId, userName, userInfoId, role })
  → Return { access_token }
```

### CRUD Flow (dengan Cache)

```
GET /user-infos/:id
  → RedisService.get(`userinfo:id:${id}`)
  → Cache hit? return cached
  → Cache miss? UserInfoRepository.findOne({ _id: id })
  → RedisService.set(key, user, 300)  // TTL 5 menit
  → Return user

PUT /user-infos/:id
  → Ownership check (user hanya edit diri sendiri)
  → Role check (user tidak bisa assign admin)
  → Unique fields check
  → UserInfoRepository.update({ _id: id }, dto)
  → invalidateCache(id)  // hapus semua cache key terkait
  → Return updated user

POST /user-infos
  → Role check (user tidak bisa buat admin)
  → Unique fields check
  → userName uniqueness check di accountlogins
  → Create UserInfo → dapat _id
  → Hash password → Create AccountLogin dengan userInfoId
  → Return user
```

### Cache Invalidation Flow

```
Write operation (create/update/delete)
  → invalidateCache(id)
  → UserInfoRepository.findOne({ _id: id }) → ambil accountNumber, registrationNumber
  → RedisService.del(`userinfo:id:${id}`)
  → RedisService.del(`userinfo:account:${accountNumber}`)
  → RedisService.del(`userinfo:registration:${registrationNumber}`)
```

---

## API Endpoints

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/v1/auth/login` | Public | Login, return JWT |

### User Info

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/v1/user-infos` | admin, user | List users (filter, sort, pagination) |
| GET | `/api/v1/user-infos/account-number/:accountNumber` | admin, user | Get by accountNumber |
| GET | `/api/v1/user-infos/registration-number/:registrationNumber` | admin, user | Get by registrationNumber |
| GET | `/api/v1/user-infos/:id` | admin, user | Get by _id |
| POST | `/api/v1/user-infos` | admin, user | Create user + account login |
| PUT | `/api/v1/user-infos/:id` | admin, user* | Update user (*ownership check) |
| DELETE | `/api/v1/user-infos/:id` | admin only | Delete user |

### Account Login

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/v1/account-logins` | admin, user | List accounts |
| GET | `/api/v1/account-logins/inactive` | admin, user | Inactive > 3 days |
| GET | `/api/v1/account-logins/:id` | admin, user | Get by _id |
| POST | `/api/v1/account-logins` | admin only | Create account |
| PUT | `/api/v1/account-logins/:id` | admin only | Update account |
| DELETE | `/api/v1/account-logins/:id` | admin only | Delete account |

---

## Role-Based Access Control

| Action | Admin | User |
|---|---|---|
| View user list | ✅ | ✅ |
| View user detail | ✅ | ✅ |
| Create user (role=user) | ✅ | ✅ |
| Create user (role=admin) | ✅ | ❌ 403 |
| Edit any user | ✅ | ❌ 403 |
| Edit own data | ✅ | ✅ |
| Assign admin role | ✅ | ❌ 403 |
| Delete user | ✅ | ❌ 403 |
| Manage account-logins | ✅ | ❌ 403 |

---

## Database Schema

### UserInfo (`userinfos`)

| Field | Type | Constraint |
|---|---|---|
| `_id` | ObjectId | Auto-generated primary key |
| `fullName` | String | Required |
| `accountNumber` | String | Required, unique |
| `emailAddress` | String | Required, unique, email format |
| `registrationNumber` | String | Required, unique |
| `role` | String | Required, enum: ['admin', 'user'], default: 'user' |
| `createdAt` | Date | Auto (timestamps) |
| `updatedAt` | Date | Auto (timestamps) |

### AccountLogin (`accountlogins`)

| Field | Type | Constraint |
|---|---|---|
| `_id` | ObjectId | Auto-generated primary key |
| `userName` | String | Required, unique |
| `password` | String | Required, select: false (hidden from queries) |
| `lastLoginDateTime` | Date | Required, default: now |
| `userInfoId` | ObjectId | Required, ref: UserInfo |
| `createdAt` | Date | Auto (timestamps) |
| `updatedAt` | Date | Auto (timestamps) |

### Relationship

```
UserInfo (1) ←──── (1) AccountLogin
         _id  ←──  userInfoId
```

Satu UserInfo punya satu AccountLogin. Link via `userInfoId` (ObjectId reference).

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP server port |
| `NODE_ENV` | `development` | Environment mode |
| `MONGODB_URI` | `mongodb://localhost:27017/db_damar_backend_betest` | MongoDB connection string |
| `JWT_SECRET` | `your_jwt_secret_key_here` | Secret for signing JWT |
| `JWT_EXPIRES_IN` | `1d` | Token expiration |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |

```bash
# .env.example
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/db_damar_backend_betest
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=1d
REDIS_HOST=localhost
REDIS_PORT=6379
CORS_ORIGIN=http://localhost:5173
```

---

## Available Scripts

```bash
npm run start:dev    # Development mode (hot reload)
npm run start:debug  # Debug mode
npm run start:prod   # Production (node dist/main)
npm run build        # Compile TypeScript → dist/
npm run seed         # Seed database (dev, pakai ts-node)
npm run seed:prod    # Seed database (prod, pakai node dist/seed.js)
npm test             # Run unit tests
npm run test:watch   # Tests in watch mode
npm run test:cov     # Tests with coverage
npm run lint         # ESLint + auto-fix
npm run format       # Prettier formatting
```

---

## How to Run

### Local Development

```bash
cd backend
cp .env.example .env
npm install
npm run seed        # buat admin + user default
npm run start:dev   # http://localhost:3000
```

### Production

```bash
npm run build
npm run seed:prod
npm run start:prod
```

### Docker

```bash
# Dari root project
docker-compose up --build

# Seed di dalam container:
docker exec ms-damar-backend-betest node dist/seed.js
```

### Run Tests

```bash
npm test           # single run
npm run test:watch # watch mode
npm run test:cov   # with coverage
```

---

## Seed Data

| Role | Username | Password | FullName | AccountNumber | Email |
|---|---|---|---|---|---|
| admin | `admin` | `admin123` | Admin User | 100000000 | admin@example.com |
| user | `user` | `user123` | Regular User | 100000001 | user@example.com |

Regular user's `lastLoginDateTime` di-set 5 hari lalu — berguna untuk test endpoint "inactive accounts".

---

## Common Development Tasks

### Menambah Module Baru

1. Buat folder di `src/modules/new-module/`
2. Buat: `schema.ts`, `dto/`, `repository.ts`, `service.ts`, `controller.ts`, `module.ts`
3. Import module di `app.module.ts`
4. Tambah `@Roles()` decorator di controller methods

### Menambah Endpoint Baru

1. Tambah method di controller dengan decorator `@Get()`, `@Post()`, dll
2. Tambah `@Roles('admin', 'user')` atau `@Public()`
3. Tambah logic di service
4. Tambah DTO jika perlu validasi input

### Menambah Cache

```ts
// Di service method:
const cacheKey = this.cacheKey('custom:key');
const cached = await this.redisService.get<T>(cacheKey);
if (cached) return cached;

const data = await this.repository.findOne({ ... });
await this.redisService.set(cacheKey, data);  // TTL 5 menit
return data;

// Di update/delete method:
await this.invalidateCache(id);  // hapus semua cache terkait
```

### Menambah Test

1. Buat file `*.spec.ts` di folder yang sama dengan file yang di-test
2. Mock dependencies menggunakan `@nestjs/testing` `Test.createTestingModule`
3. Run: `npm test`

---

## Troubleshooting

### MongoDB connection error

```bash
# Pastikan MongoDB running
mongosh --eval "db.runCommand({ ping: 1 })"

# Jika tidak running:
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

### Redis connection error

```bash
# Pastikan Redis running
redis-cli ping  # harus return PONG

# Jika tidak running:
brew services start redis   # macOS
sudo systemctl start redis  # Linux
```

### Port 3000 sudah dipakai

```bash
lsof -i :3000
kill -9 <PID>
```

### Seed gagal "Seed data already exists"

Data sudah ada. Untuk re-seed:
```bash
mongosh --eval "db.userinfos.drop(); db.accountlogins.drop()" db_damar_backend_betest
npm run seed
```

### JWT token invalid setelah restart

Token lama masih valid selama `JWT_EXPIRES_IN` (1 hari). Tidak perlu action — akan expired sendiri. Atau clear localStorage di frontend.

---

## File Reference

| File | Purpose |
|---|---|
| `src/main.ts` | Bootstrap app, set global prefix `/api`, URI versioning `v1`, CORS, Swagger, validation pipe |
| `src/app.module.ts` | Root module, imports semua feature modules, register global guards |
| `src/seed.ts` | Create admin + user default dengan hashed password |
| `src/config/database.config.ts` | MongoDB connection factory dari `MONGODB_URI` |
| `src/config/jwt.config.ts` | JWT options dari `JWT_SECRET` + `JWT_EXPIRES_IN` |
| `src/common/decorators/public.decorator.ts` | `@Public()` — set metadata `isPublic: true` |
| `src/common/decorators/roles.decorator.ts` | `@Roles(...roles)` — set metadata `roles` |
| `src/common/guards/jwt-auth.guard.ts` | Check `@Public()`, skip auth jika ada |
| `src/common/guards/roles.guard.ts` | Check `@Roles()` metadata, compare dengan `request.user.role` |
| `src/common/filters/http-exception.filter.ts` | Format error response: `{ statusCode, message, errors?, timestamp }` |
| `src/common/repositories/base.repository.ts` | Abstract CRUD: findAll, findOne, create, update, delete, count |
| `src/modules/auth/auth.service.ts` | `validateCredentials()`, `login()`, JWT signing |
| `src/modules/auth/strategies/jwt.strategy.ts` | Passport JWT strategy, extract Bearer token |
| `src/modules/user-info/user-info.service.ts` | CRUD + cache + enrichment + ownership check |
| `src/modules/user-info/user-info.repository.ts` | findByAccountNumber, findByRegistrationNumber, existsByUniqueFields |
| `src/modules/user-info/schemas/user-info.schema.ts` | Mongoose schema: fullName, accountNumber, emailAddress, registrationNumber, role |
| `src/modules/account-login/account-login.service.ts` | CRUD + password hashing |
| `src/modules/account-login/account-login.repository.ts` | findByUserName, findInactive |
| `src/modules/account-login/schemas/account-login.schema.ts` | Mongoose schema: userName, password, lastLoginDateTime, userInfoId |
| `src/modules/redis/redis.service.ts` | get, set (TTL), del, delPattern |
| `src/modules/redis/redis.module.ts` | Global module, Redis client factory |
