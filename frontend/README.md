# Frontend - User Management App

Single-page application untuk manajemen user dengan login, CRUD, offline cache, dan role-based access control.

> **Baru pertama kali buka repo ini?** Langsung ke [Quick Start](#quick-start).

---

## Prerequisites

| Requirement | Version | Check |
|---|---|---|
| Node.js | 20+ | `node -v` |
| npm | 9+ | `npm -v` |
| Backend API | Running | `curl http://localhost:3000/api/v1` |
| MongoDB | Running | `mongosh` (opsional, untuk cek data) |

> **Penting:** Frontend tidak bisa jalan sendiri. Backend harus running dulu di `http://localhost:3000`. Lihat `../RUN.md` untuk cara jalankan backend.

---

## Quick Start

```bash
# 1. Pastikan backend sudah running di port 3000

# 2. Setup frontend
cd frontend
cp .env.example .env
npm install
npm run dev

# 3. Buka http://localhost:5173
# 4. Login dengan:
#    Admin → username: admin, password: admin123
#    User  → username: user,  password: user123
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
| **Vite** | 5.x | Dev server sangat cepat karena pakai native ESM (tidak perlu bundle saat dev). HMR instant. Config lebih simpel dari CRA. |
| **React** | 18.x | Stable, concurrent features, large ecosystem. |
| **TypeScript** | 5.x | Type safety mengurangi runtime error. IntelliSense membantu saat development. |
| **Redux Toolkit** | 2.x | Menghilangkan boilerplate Redux lama. Sudah include Immer (immutable update), `createSlice`, `createAsyncThunk`. |
| **Redux Saga** | 1.x | Generator-based side effect management. Lebih powerful dari Thunk untuk flow kompleks: cancel, debounce, retry, race. Penting untuk caching + offline logic. |
| **Redux Thunk** | (built-in RTK) | Untuk flow sederhana (login) yang cuma 1 async call, Thunk lebih simpel dari Saga. |
| **Axios** | 1.6 | Interceptor support — bisa inject JWT di setiap request dan handle 401 global di satu tempat. |
| **React Hook Form** | 7.x | Uncontrolled input = minim re-render. Built-in validation tanpa perlu Yup/Zod tambahan. |
| **Tailwind CSS** | 3.x | Utility-first, tidak perlu bikin file CSS terpisah. Konsisten secara spacing/warna. Responsive gampang. |
| **React Router** | 6.x | Declarative routing, nested routes, `<Outlet />` untuk layout. |
| **Vitest** | 1.x | Compatible dengan Vite, API mirip Jest, fast karena share transform dengan Vite. |

---

## Project Structure

```
frontend/
├── .env                          # VITE_API_URL (local dev only)
├── .env.example                  # Template env vars
├── Dockerfile                    # Multi-stage build (Node → Nginx)
├── nginx.conf                    # SPA routing + API reverse proxy
├── package.json
├── vite.config.ts                # Vite config + proxy + Vitest
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── index.html                    # Vite entry HTML
│
└── src/
    ├── main.tsx                  # React entry point, mount <App />
    ├── App.tsx                   # Root component: routing + providers
    ├── index.css                 # Tailwind directives (@tailwind base/components/utilities)
    │
    ├── api/
    │   └── axios.ts              # Axios instance + JWT interceptor + 401 handler
    │
    ├── components/
    │   ├── common/
    │   │   ├── Modal.tsx         # Reusable modal (Escape/backdrop close)
    │   │   └── OfflineBanner.tsx # Amber banner saat offline
    │   └── layout/
    │       └── MainLayout.tsx    # Authenticated shell (header + <Outlet />)
    │
    ├── hooks/
    │   └── useOnlineStatus.tsx   # Context + hook untuk navigator.onLine
    │
    ├── pages/
    │   ├── LoginPage.tsx         # Login form
    │   ├── UserListPage.tsx      # Paginated table + search/filter/sort
    │   ├── UserDetailPage.tsx    # Single user view
    │   ├── UserFormPage.tsx      # Create/edit form (react-hook-form)
    │   └── NotFoundPage.tsx      # 404
    │
    ├── redux/
    │   ├── store.ts              # configureStore + saga middleware
    │   ├── slices/
    │   │   ├── auth.slice.ts     # Login thunk, JWT decode, logout
    │   │   └── userInfo.slice.ts # CRUD state (manual actions, consumed by sagas)
    │   └── sagas/
    │       ├── index.ts          # Root saga
    │       └── userInfo.saga.ts  # Fetch/create/update/delete + cache logic
    │
    ├── services/
    │   └── cache.service.ts      # localStorage wrapper: TTL, prefix, eviction
    │
    ├── types/
    │   └── user-info.ts          # TypeScript interfaces
    │
    └── test/
        └── setup.ts              # Vitest setup (jest-dom matchers)
```

---

## Architecture Decisions

### Kenapa pakai Redux Saga, bukan RTK Query?

**Alasan:** Aplikasi ini butuh offline read support. RTK Query menyimpan cache **in-memory saja** — hilang saat refresh. Dengan Saga, kita bisa kontrol penuh kapan dan bagaimana data di-cache ke `localStorage`, termasuk TTL dan invalidation pattern.

**Trade-off:** Lebih verbose dari RTK Query, tapi memberikan fleksibilitas untuk:
- Cache response ke localStorage dengan custom key pattern
- Fallback ke cache saat offline
- Invalidate cache berdasarkan pattern (`users:list:*`) setelah write operation
- Evict cache tertua saat storage penuh

### Kenapa Thunk untuk auth, Saga untuk CRUD?

**Auth (Thunk):**
- Login = 1 API call → simpan token → selesai
- Flow linear, tidak butuh cancel/debounce/retry
- `createAsyncThunk` sudah cukup, lebih simpel

**CRUD (Saga):**
- Fetch = check online → hit API / read cache → cache response → dispatch success
- Write = hit API → invalidate multiple cache keys → dispatch success
- Butuh `takeLatest` (debounce search) dan `takeEvery` (write ops)
- Generator pattern membuat flow ini lebih readable dan testable

### Kenapa decode JWT manual, bukan pakai `jwt-decode`?

JWT payload cuma butuh `role` field. Cukup 3 baris:
```ts
const payload = JSON.parse(atob(token.split('.')[1]));
return payload.role || null;
```
Tidak perlu tambah dependency untuk sesuatu yang sesederhana ini. Jika kebutuhan bertambah (validasi expiry, multiple claims), baru pertimbangkan library.

### Kenapa Nginx proxy, bukan CORS langsung?

Di Docker, frontend dan backend beda container. Ada 2 opsi:
1. **CORS:** Backend set `Access-Control-Allow-Origin`, frontend pakai full URL `http://backend:3000`
2. **Nginx proxy:** Frontend panggil `/api/*`, nginx forward ke backend

Dipilih **Nginx proxy** karena:
- Tidak perlu expose backend port ke browser
- Tidak ada CORS issue sama sekali
- Production-ready (standard pattern untuk SPA + API)
- `VITE_API_URL` tidak perlu di-set di Docker, cukup relative path `/api/v1`

### Kenapa localStorage cache, bukan Service Worker?

Service Worker lebih kompleks untuk setup dan debugging. Untuk kebutuhan "baca data saat offline", localStorage sudah cukup:
- Simpel: `setItem` / `getItem`
- Sync: tidak perlu async handling
- Persist: survive refresh browser
- Predictable: TTL + explicit eviction

### Kenapa multi-stage Docker build?

```
Stage 1 (node:20-alpine)  → npm ci + npm run build → hasil: dist/ folder (~5MB)
Stage 2 (nginx:alpine)    → copy dist/ → serve static files
```
- Image final cuma ~25MB (nginx-alpine), bukan ~500MB (node)
- Tidak ada source code / node_modules di production image
- Nginx jauh lebih performan untuk serve static files dari Node.js

---

## State Management Flow

### Auth Flow (Thunk)

**Login:**
```
LoginPage → dispatch(loginThunk({ userName, password }))
         → POST /auth/login
         → response: { access_token }
         → localStorage.setItem('token', token)
         → decode JWT payload → extract role
         → Redux state: { token, role }
         → redirect to /users
```

**Logout (manual):**
```
User klik "Logout" button (MainLayout)
  → dispatch(logout())
  → Redux: token = null, role = null
  → localStorage.removeItem('token')
  → navigate('/login')
  → App.tsx: token null → <Navigate to="/login" />
```

**Logout (auto, via 401):**
```
API response status 401 (token expired/invalid)
  → axios interceptor (src/api/axios.ts)
  → localStorage.removeItem('token')
  → window.location.href = '/login'
```

> **Note:** Auto-logout pakai `window.location.href` bukan `useNavigate` karena interceptor berjalan di luar React component tree. Ini me-reload halaman, jadi Redux state juga reset.

### CRUD Flow (Saga)

```
UserListPage → dispatch(fetchUsersStart(filter))
            → Saga intercepts (takeLatest)
            → check navigator.onLine
            │
            ├─ ONLINE:
            │  → GET /user-infos?filter...
            │  → CacheService.set(key, response)   // cache ke localStorage
            │  → dispatch(fetchUsersSuccess(data))
            │
            └─ OFFLINE:
               → CacheService.get(key)
               ├─ hit  → dispatch(fetchUsersSuccess(cached))
               └─ miss → dispatch(fetchUsersFailure("No cached data"))
```

### Cache Invalidation Flow

```
UserFormPage → dispatch(createUserStart(data))
            → Saga: POST /user-infos
            → CacheService.delPattern('users:list:*')  // invalidate semua list cache
            → dispatch(createUserSuccess(newUser))
```

### Redux Store Shape

```ts
{
  auth: {
    token: string | null,     // JWT token
    role: string | null,      // 'admin' | 'user' (decoded from JWT)
    loading: boolean,         // login in progress
    error: string | null
  },
  userInfo: {
    users: UserInfo[],        // current page data
    total: number,            // total records (for pagination)
    selectedUser: UserInfo | null,
    loading: boolean,         // fetch in progress
    creating: boolean,
    updating: boolean,
    deleting: boolean,
    error: string | null,
    isOnline: boolean,
    filter: {
      page: number,           // default: 1
      limit: number,          // default: 10
      sort: string,           // default: 'fullName'
      fullName?: string,      // search keyword
      role?: string           // filter by role
    }
  }
}
```

---

## API Layer

### Axios Instance (`src/api/axios.ts`)

```ts
baseURL: import.meta.env.VITE_API_URL || '/api/v1'
```

**Request interceptor:** Otomatis attach `Authorization: Bearer <token>` di setiap request. Token diambil dari `localStorage`.

**Response interceptor:** Jika response 401 (unauthorized), hapus token dan redirect ke `/login`. Ini menangani kasus token expired tanpa perlu handle di setiap page. Perbedaan dengan manual logout: auto-logout pakai `window.location.href` (reload page) karena interceptor di luar React tree.

### Proxy (Dev vs Docker)

| Environment | API URL | How It Works |
|---|---|---|
| Local dev (`npm run dev`) | `/api/v1` | Vite proxy → `http://localhost:3000` |
| Docker | `/api/v1` | Nginx proxy → `http://ms-damar-backend-betest:3000` |
| `.env` override | `http://localhost:3000/api/v1` | Direct call (tanpa proxy) |

Dalam Docker, `VITE_API_URL` tidak perlu di-set karena nginx sudah handle proxy. Frontend cukup pakai default `/api/v1`.

---

## Caching Strategy

### CacheService (`src/services/cache.service.ts`)

Wrapper around `localStorage` dengan fitur:

| Feature | Detail |
|---|---|
| **Prefix** | `damar-betest:` (avoid collision dengan app lain) |
| **TTL** | 5 menit (default), expired items auto-removed saat `get()` |
| **Key pattern** | `users:list:p1:l10:fullName:all:s` (page:limit:sort:role:search) |
| **Pattern delete** | `delPattern('users:list:*')` — hapus semua cache list |
| **Eviction** | Saat localStorage penuh, hapus 1/3 item terlama, lalu retry |

### Cache Key Format

```
damar-betest:users:list:p1:l10:fullName:all:s        → page 1, 10 items, sort by name, all roles, no search
damar-betest:users:list:p2:l10:fullName:admin:sJohn   → page 2, admin only, search "John"
damar-betest:users:detail:507f1f77bcf86cd799439011      → single user by _id
damar-betest:users:detail:account:ACC123              → single user by accountNumber
```

### When Cache Is Used

| Operation | Online | Offline |
|---|---|---|
| GET (list) | Hit API → cache response | Read from cache |
| GET (detail) | Hit API → cache response | Read from cache |
| POST/PUT/DELETE | Hit API → invalidate list + detail cache | **Fail** (write requires network) |

---

## Role-Based UI

Role di-decode dari JWT payload dan disimpan di Redux `auth.role`.

| Feature | Admin | User |
|---|---|---|
| View user list | ✅ | ✅ |
| View user detail | ✅ | ✅ |
| Create user (role=user) | ✅ | ✅ |
| Create user (role=admin) | ✅ | ❌ (dropdown disabled) |
| Edit user | ✅ | ✅ |
| Delete button visible | ✅ | ❌ (hidden) |

Role check di frontend bersifat **cosmetic**. Backend tetap validasi semua permission via `RolesGuard`. Frontend hanya menyembunyikan UI untuk UX yang lebih baik.

---

## Routes

| Path | Component | Auth | Description |
|---|---|---|---|
| `/login` | `LoginPage` | Public | Redirect ke `/users` jika sudah login |
| `/` | `MainLayout` | Protected | Redirect ke `/login` jika belum login |
| `/users` | `UserListPage` | Protected | Daftar user dengan pagination, search, filter, sort |
| `/users/add` | `UserFormPage` | Protected | Form tambah user baru |
| `/users/:id` | `UserDetailPage` | Protected | Detail satu user |
| `/users/edit/:id` | `UserFormPage` | Protected | Form edit user |
| `*` | `NotFoundPage` | Public | Halaman 404 |

**Protected route mechanism:** `App.tsx` check `auth.token` dari Redux. Jika `null`, redirect ke `/login`. Tidak pakai wrapper component — langsung conditional di `<Route element>`.

---

## Pages

### LoginPage
Form login dengan username + password. Dispatch `loginThunk`, simpan JWT ke localStorage. Error ditampilkan inline.

### UserListPage
- Tabel dengan kolom: Name, Account No, Email, Role, Actions
- **Search:** debounce 300ms, filter by `fullName`
- **Filter:** dropdown role (All/Admin/User)
- **Sort:** Name A-Z/Z-A, Registration A-Z/Z-A
- **Pagination:** Previous/Next, 10 items per page
- **Delete:** admin only, confirmation via Modal
- **Offline:** data tetap tampil dari cache

### UserDetailPage
Menampilkan semua field user. Link ke Edit page.

### UserFormPage
- Dual-purpose: Add (tanpa `:id`) atau Edit (dengan `:id`)
- React Hook Form dengan validation (required, email pattern)
- `FormInput` pakai `React.forwardRef` agar react-hook-form bisa register ref
- Role dropdown: admin bisa pilih "admin", user biasa hanya "user"

### NotFoundPage
Simple 404 dengan link ke `/users`.

---

## Components

### Modal (`src/components/common/Modal.tsx`)
- Props: `isOpen`, `onClose`, `title`, `children`
- Close on: Escape key, backdrop click, X button
- `stopPropagation` pada inner content agar click di dalam modal tidak close

### OfflineBanner (`src/components/common/OfflineBanner.tsx`)
- Amber banner: "You are offline. Showing cached data."
- Hanya muncul saat `isOnline === false`
- Menggunakan `useOnlineStatus` hook

### MainLayout (`src/components/layout/MainLayout.tsx`)
- Dark header dengan "User Management" title + Logout button
- `<Outlet />` untuk render child routes
- Logout: dispatch `logout()` → clear token + role + localStorage → navigate ke `/login`
- Protected routes di `App.tsx` check `token` — jika `null`, redirect ke `/login`

---

## Hooks

### useOnlineStatus (`src/hooks/useOnlineStatus.tsx`)

```tsx
const { isOnline } = useOnlineStatus();
```

- Context-based: `OnlineStatusProvider` wrap entire app di `App.tsx`
- Listen ke `window.online` / `window.offline` events
- Initialize dengan `navigator.onLine`
- Digunakan oleh `OfflineBanner` dan saga (untuk decide cache vs API)

---

## Types (`src/types/user-info.ts`)

```ts
interface UserInfo {
  _id: string;              // MongoDB ObjectId (primary key)
  fullName: string;
  accountNumber: string;
  emailAddress: string;
  registrationNumber: string;
  role: 'admin' | 'user';
  createdAt?: string;
  updatedAt?: string;
  accountId?: string | null;        // From account-login join
  lastLoginDateTime?: string | null; // From account-login join
}

interface UserInfoListResponse {
  data: UserInfo[];
  total: number;          // Untuk pagination
}

interface UserInfoFilter {
  fullName?: string;      // Search keyword
  role?: string;          // Filter by role
  sort?: string;          // Sort field (prefix - untuk descending)
  page?: number;
  limit?: number;
}

interface UserInfoFormData {
  fullName: string;
  accountNumber: string;
  emailAddress: string;
  registrationNumber: string;
  role: 'admin' | 'user';
}
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `/api/v1` | Backend API base URL. Di Docker tidak perlu di-set (nginx proxy handle). |

```bash
# .env.example
VITE_API_URL=http://localhost:3000/api/v1
```

> **Note:** Vite env vars adalah **build-time**, bukan runtime. Nilai di-replace saat `npm run build`. Untuk Docker, nginx proxy lebih reliable daripada env var.

---

## Available Scripts

```bash
npm run dev        # Start dev server (port 5173)
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
npm test           # Run all tests (single run)
npm run test:watch # Run tests in watch mode
```

---

## How to Run

### Local Development

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Dev server berjalan di `http://localhost:5173`. API calls di-proxy ke `http://localhost:3000` (backend harus running).

### Docker

```bash
# Dari root project
docker-compose up --build
```

Frontend di-serve oleh Nginx di `http://localhost:8080`. Tidak perlu setup `.env` — nginx proxy sudah handle routing ke backend.

### Run Tests

```bash
npm test           # single run
npm run test:watch # watch mode
```

Test files:
- `src/services/cache.service.spec.ts` — CacheService unit tests
- `src/redux/slices/userInfo.slice.spec.ts` — Redux slice tests
- `src/redux/sagas/userInfo.saga.spec.ts` — Saga tests (dengan `redux-saga-test-plan`)
- `src/components/common/OfflineBanner.spec.tsx` — Component test

---

## File Reference

| File | Purpose |
|---|---|
| `src/main.tsx` | Mount `<App />` ke `#root`, wrap dengan `Provider` + `BrowserRouter` |
| `src/App.tsx` | Routing, `OnlineStatusProvider`, conditional redirect berdasarkan auth token |
| `src/api/axios.ts` | Axios instance, JWT interceptor, 401 auto-redirect |
| `src/redux/store.ts` | `configureStore` dengan auth + userInfo reducers + saga middleware |
| `src/redux/slices/auth.slice.ts` | `loginThunk`, JWT decode, `logout`, `clearError` |
| `src/redux/slices/userInfo.slice.ts` | Manual actions untuk CRUD (dispatched oleh sagas) |
| `src/redux/sagas/index.ts` | Root saga: combine semua watcher sagas |
| `src/redux/sagas/userInfo.saga.ts` | 6 watcher sagas: fetch list, fetch detail, fetch by account, create, update, delete. Setiap saga handle online/offline logic + caching |
| `src/services/cache.service.ts` | localStorage wrapper: `set`, `get`, `remove`, `delPattern`, `clear`, `evictOldest` |
| `src/hooks/useOnlineStatus.tsx` | `OnlineStatusProvider` + `useOnlineStatus()` hook |
| `src/pages/LoginPage.tsx` | Login form, dispatch `loginThunk` |
| `src/pages/UserListPage.tsx` | Paginated table, search/filter/sort, delete with modal confirmation |
| `src/pages/UserDetailPage.tsx` | Single user detail view |
| `src/pages/UserFormPage.tsx` | Create/edit form with react-hook-form, `FormInput` with `forwardRef` |
| `src/pages/NotFoundPage.tsx` | 404 page |
| `src/components/common/Modal.tsx` | Reusable modal with Escape/backdrop close |
| `src/components/common/OfflineBanner.tsx` | Amber banner for offline state |
| `src/components/layout/MainLayout.tsx` | Authenticated shell: header + `<Outlet />` |
| `src/types/user-info.ts` | TypeScript interfaces: `UserInfo`, `UserInfoListResponse`, `UserInfoFilter`, `UserInfoFormData` |
| `vite.config.ts` | Vite config: React plugin, `@` alias, dev proxy, Vitest config |
| `nginx.conf` | SPA routing (`try_files`), API reverse proxy ke backend container |
| `Dockerfile` | Multi-stage: Node build → Nginx serve |

---

## Conventions

### File Naming

| Type | Pattern | Example |
|---|---|---|
| Component | `PascalCase.tsx` | `UserListPage.tsx` |
| Hook | `camelCase.tsx` | `useOnlineStatus.tsx` |
| Service | `camelCase.service.ts` | `cache.service.ts` |
| Redux slice | `camelCase.slice.ts` | `auth.slice.ts` |
| Redux saga | `camelCase.saga.ts` | `userInfo.saga.ts` |
| Test file | `*.spec.ts(x)` | `cache.service.spec.ts` |
| Type | `kebab-case.ts` | `user-info.ts` |

### Import Pattern

```tsx
// External libs first
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Internal: use @ alias (configured in vite.config.ts + tsconfig.json)
import { RootState } from '@/redux/store';
import { fetchUsersStart } from '@/redux/slices/userInfo.slice';
import { UserInfo } from '@/types/user-info';
import Modal from '@/components/common/Modal';
```

> **Path alias:** `@/` maps ke `src/`. Tidak perlu relative path `../../../`. Config di `vite.config.ts` dan `tsconfig.json`.

### Color Scheme (Tailwind)

| Purpose | Color | Usage |
|---|---|---|
| Primary | `emerald-600` / `emerald-700` | Buttons, links, active states |
| Background | `slate-50` / `slate-100` | Page bg, card bg |
| Text | `slate-900` (heading) / `slate-600` (body) | Typography |
| Border | `slate-200` / `slate-300` | Cards, inputs |
| Header | `slate-900` | MainLayout header |
| Error | `red-600` / `red-50` | Error text / error bg |
| Warning | `amber-100` / `amber-700` | Offline banner |
| Admin badge | `emerald-100` / `emerald-700` | Role badge |
| User badge | `slate-100` / `slate-700` | Role badge |

Gunakan warna ini saat menambah UI baru agar konsisten.

---

## Common Development Tasks

### Menambah Page Baru

1. Buat file di `src/pages/NewPage.tsx`
2. Tambah route di `src/App.tsx`:
   ```tsx
   // Di dalam <Route path="/" element={<MainLayout />}>
   <Route path="new-page" element={<NewPage />} />
   ```
3. Jika butuh data dari API, tambah saga + slice (lihat di bawah)

### Menambah API Endpoint

1. **Tambah action di slice** (`src/redux/slices/userInfo.slice.ts`):
   ```ts
   fetchNewThingStart: (state, _action: PayloadAction<string>) => {
     state.loading = true;
     state.error = null;
   },
   fetchNewThingSuccess: (state, action: PayloadAction<SomeType>) => {
     state.loading = false;
     // update state
   },
   fetchNewThingFailure: (state, action: PayloadAction<string>) => {
     state.loading = false;
     state.error = action.payload;
   },
   ```

2. **Tambah saga** (`src/redux/sagas/userInfo.saga.ts`):
   ```ts
   function* fetchNewThingSaga(action: ReturnType<typeof fetchNewThingStart>) {
     try {
       const response: { data: SomeType } = yield call(
         [api, 'get'],
         '/new-endpoint',
       );
       yield put(fetchNewThingSuccess(response.data));
     } catch (error: any) {
       yield put(fetchNewThingFailure(error.response?.data?.message || 'Failed'));
     }
   }

   function* watchFetchNewThing() {
     yield takeLatest('userInfo/fetchNewThingStart', fetchNewThingSaga);
   }
   ```

3. **Register watcher** di `watchFetchNewThing()` dalam `userInfoSaga`:
   ```ts
   yield all([
     // ... existing watchers
     watchFetchNewThing(),
   ]);
   ```

4. **Dispatch dari component:**
   ```tsx
   const dispatch = useDispatch();
   useEffect(() => {
     dispatch(fetchNewThingStart('some-param'));
   }, [dispatch]);
   ```

### Menambah Component Baru

1. Buat di `src/components/common/NewComponent.tsx`
2. Export default
3. Import dengan `@` alias:
   ```tsx
   import NewComponent from '@/components/common/NewComponent';
   ```

### Menambah Type Baru

Tambah di `src/types/user-info.ts` (atau buat file baru di `src/types/` jika tidak related).

### Menambah Test

1. Buat file `*.spec.ts(x)` di folder yang sama dengan file yang di-test
2. Gunakan `@testing-library/react` untuk component test
3. Gunakan `redux-saga-test-plan` untuk saga test
4. Run: `npm test` (single) atau `npm run test:watch` (watch mode)

---

## Troubleshooting

### "Network Error" atau CORS error

**Penyebab:** Backend tidak running, atau salah port.

```bash
# Cek backend running
curl http://localhost:3000/api/v1

# Jika tidak running, start dulu:
cd ../backend && npm run start:dev
```

### 401 Unauthorized di semua request

**Penyebab:** Token expired atau tidak ada. Axios interceptor otomatis redirect ke `/login` dan hapus token.

```bash
# Jika terjadi terus-menerus:
# 1. Cek backend running
curl http://localhost:3000/api/v1

# 2. Cek token di browser console
localStorage.getItem('token')

# 3. Jika token ada tapi 401 terus → token expired
#    Auto-logout sudah jalan, cukup login ulang
```

### Data tidak update setelah edit/create

**Penyebab:** Cache masih fresh (TTL 5 menit).

```bash
# Di browser console, hapus cache:
localStorage.clear()
# Atau tunggu 5 menit, atau buka di incognito
```

### Offline banner muncul padahal online

**Penyebab:** Browser salah detect status. Biasanya terjadi saat network switch.

```bash
# Refresh page, atau:
# Di browser console:
window.dispatchEvent(new Event('online'))
```

### `npm run dev` error "Port 5173 already in use"

```bash
# Cari proses yang pakai port
lsof -i :5173

# Kill prosesnya, atau ganti port di vite.config.ts
# server: { port: 5174 }
```

### Test gagal "localStorage is not defined"

**Penyebab:** Test environment tidak punya localStorage.

```bash
# Sudah di-handle di src/test/setup.ts
# Jika masih error, pastikan setup.ts di-include di vitest config
# (sudah dikonfigurasi di vite.config.ts → test.setupFiles)
```

### Build error "Cannot find module '@/...'"

**Penyebab:** Path alias tidak dikonfigurasi di tsconfig.json.

```json
// tsconfig.json harus ada:
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": { "@/*": ["src/*"] }
  }
}
```

---

## FAQ

**Q: Kenapa ada 2 state management (Thunk + Saga)?**
A: Auth pakai Thunk karena flow sederhana (1 API call). CRUD pakai Saga karena butuh caching + offline logic + debounce. Lihat [Architecture Decisions](#architecture-decisions).

**Q: Kenapa tidak pakai React Query / TanStack Query?**
A: Karena butuh offline read dari localStorage. React Query cache in-memory hilang saat refresh. Lihat [Kenapa localStorage cache](#kenapa-localstorage-cache-bukan-service-worker).

**Q: Kenapa `VITE_API_URL` tidak ada di docker-compose.yml?**
A: Karena Vite env vars adalah build-time, bukan runtime. Di Docker, nginx handle proxy. Lihat [Proxy (Dev vs Docker)](#proxy-dev-vs-docker).

**Q: Bagaimana cara clear cache?**
A: Di browser console: `localStorage.clear()`. Atau tunggu 5 menit (TTL default).

**Q: Kenapa `FormInput` pakai `React.forwardRef`?**
A: React Hook Form butuh `ref` untuk register input. Tanpa `forwardRef`, ref tidak bisa di-pass ke component wrapper.

**Q: Dimana login credentials?**
A: `admin` / `admin123` dan `user` / `user123`. Seed via backend.

**Q: Bagaimana cara tambah field baru di user?**
A: 1) Tambah field di backend schema + DTO. 2) Tambah di `src/types/user-info.ts`. 3) Tambah input di `UserFormPage.tsx`. 4) Tambah kolom di `UserListPage.tsx` (opsional).

**Q: Axios interceptor pakai `window.location.href`, kenapa bukan `useNavigate`?**
A: Axios interceptor berjalan di luar React component tree, jadi tidak bisa pakai hook. `window.location.href` adalah cara paling reliable untuk redirect dari luar React.

**Q: Kenapa `takeLatest` untuk fetch, `takeEvery` untuk write?**
A: `takeLatest` cancel request lama saat request baru masuk — cocok untuk search (user ketik cepat, cuma response terakhir yang dipakai). `takeEvery` tidak cancel — cocok untuk write (create/update/delete tidak boleh di-cancel).

**Q: Kenapa `React.StrictMode` di `main.tsx`?**
A: StrictMode double-render di dev mode untuk detect side effect. Ini artinya saga bisa jalan 2x saat development. Ini normal, tidak terjadi di production.

**Q: Kenapa `useEffect` cleanup dispatch `clearSelectedUser`?**
A: Tanpa cleanup, saat navigate dari user A ke user B, data user A akan flash sebentar sebelum data user B load. Cleanup mencegah stale data.

**Q: Kenapa debounce 300ms di UserListPage?**
A: Tanpa debounce, setiap huruf yang diketik di search trigger API call. "John" = 5 request. Dengan debounce, cuma 1 request setelah user berhenti ketik 300ms.

**Q: Kenapa `e.stopPropagation()` di Modal?**
A: Klik di dalam modal (misal button) akan bubble up ke backdrop dan menutup modal tanpa `stopPropagation`. Inner click stop di situ, backdrop click tetap close modal.

**Q: Kenapa `strictPort: true` di vite.config?**
A: Kalau port 5173 busy, Vite default auto-increment ke 5174. Dengan `strictPort`, Vite error instead. Ini sengaja karena proxy config hardcode ke port 5173.

**Q: Kenapa `isolatedModules: true` di tsconfig?**
A: Vite pakai esbuild untuk compile, yang tidak bisa analisis cross-file type. Flag ini menangkap error saat ada type-only export yang bisa rusak saat compile.

**Q: Kenapa `createCache()` factory function, bukan singleton?**
A: Dibuat factory agar test bisa mock. Kalau singleton di module level, sulit di-mock dan test bisa saling interfere lewat shared state.

**Q: Kenapa nginx `try_files $uri $uri/ /index.html`?**
A: SPA routing: React Router handle routing di client. Tanpa ini, refresh di `/users/edit/123` return 404 karena nginx tidak punya file tersebut. Fallback ke `index.html` membuat React Router yang handle.
