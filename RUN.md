# Panduan Menjalankan Aplikasi

Proyek ini terdiri dari 2 bagian utama: **Backend** (NestJS + MongoDB + Redis) dan **Frontend** (Vite + React). Ada 2 cara menjalankan: via Docker Compose (paling praktis) atau manual per service.

## Prasyarat

Pastikan sudah terinstall:
- [Node.js](https://nodejs.org/) versi 20 atau lebih tinggi
- [Docker](https://docs.docker.com/get-docker/) dan Docker Compose
- [npm](https://www.npmjs.com/) (biasanya sudah include dengan Node.js)

## Cara 1: Menjalankan dengan Docker Compose (Direkomendasikan)

Cara ini paling mudah karena semua service (MongoDB, Redis, Backend, Frontend) berjalan otomatis dalam container.

### 1. Masuk ke folder proyek

```bash
cd /Users/macbookair/Desktop/damar-backend-betest
```

### 2. Jalankan semua service

```bash
docker-compose up --build
```

Perintah di atas akan:
- Build image backend dan frontend
- Menjalankan container MongoDB, Redis, Backend, dan Frontend

### 3. Akses aplikasi

| Service | URL |
|---------|-----|
| Frontend (UI) | http://localhost:8080 |
| Backend API | http://localhost:3000/api |
| Swagger UI | http://localhost:3000/api/docs |
| MongoDB | localhost:27017 |
| Redis | localhost:6379 |

### 4. Berhenti menjalankan

Tekan `Ctrl + C` di terminal, atau jalankan di terminal lain:

```bash
docker-compose down
```

---

## Cara 2: Menjalankan Manual (Development Mode)

Cara ini cocok untuk development karena backend dan frontend auto-reload saat ada perubahan kode.

### Langkah 1: Jalankan Database dan Redis

Pastikan MongoDB dan Redis berjalan di lokal. Jika belum punya, bisa pakai Docker Compose untuk menjalankan database saja:

```bash
cd /Users/macbookair/Desktop/damar-backend-betest

docker-compose -f docker-compose.yml up mongo redis
```

Atau jika MongoDB/Redis sudah terinstall secara lokal, pastikan service-nya berjalan.

### Langkah 2: Jalankan Backend

Buka terminal baru, lalu:

```bash
cd /Users/macbookair/Desktop/damar-backend-betest/backend

# Copy file environment
cp .env.example .env

# Install dependencies
npm install

# Jalankan dalam mode development
npm run start:dev
```

Backend akan berjalan di: http://localhost:3000

Swagger UI: http://localhost:3000/api/docs

### Langkah 3: Jalankan Frontend

Buka terminal baru lagi, lalu:

```bash
cd /Users/macbookair/Desktop/damar-backend-betest/frontend

# Copy file environment
cp .env.example .env

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Frontend akan berjalan di: http://localhost:5173

---

## Seed Data (Pertama Kali Setup)

Setelah database pertama kali dibuat, jalankan seed untuk membuat user awal yang bisa dipakai login:

```bash
cd /Users/macbookair/Desktop/damar-backend-betest/backend
npm run seed
```

Seed aman dijalankan berulang — jika data sudah ada, akan skip otomatis.

### Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| User | `user` | `user123` |

### Seed di Docker

Jalankan seed di dalam container:

```bash
docker exec ms-damar-backend-betest npx ts-node src/seed.ts
```

---

## Cara 3: One-Command Local Runner (Tanpa Docker)

Script `run-local.sh` otomatis menjalankan semua: cek prerequisites, start MongoDB & Redis lokal, install dependencies, seed data, dan start backend + frontend.

```bash
cd /Users/macbookair/Desktop/damar-backend-betest
./run-local.sh
```

Tekan `Ctrl+C` untuk stop backend dan frontend. MongoDB & Redis tetap berjalan.

---

## Deploy ke VPS

### Prasyarat VPS

- Node.js 20+
- MongoDB
- Redis
- npm

### Langkah Deploy

```bash
# 1. Clone repository
git clone https://github.com/damarowen/damar-betest-202607.git
cd damar-betest-202607

# 2. Jalankan script (auto: install + seed + start)
./run-local.sh
```

Atau manual per service:

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env: ubah JWT_SECRET dan CORS_ORIGIN sesuai domain VPS
npm install
npm run build
npm run seed          # sekali saja, untuk buat user awal
npm run start:prod    # atau pakai PM2: pm2 start dist/main.js

# Frontend
cd ../frontend
cp .env.example .env
# Edit .env: VITE_API_URL=http://domain-vps-anda:3000/api
npm install
npm run build
# Serve dist/ via nginx
```

### Konfigurasi .env untuk Production

Backend `.env`:
```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/db_damar_backend_betest
JWT_SECRET=ganti_dengan_secret_yang_kuat_dan_acak
JWT_EXPIRES_IN=1d
REDIS_HOST=localhost
REDIS_PORT=6379
CORS_ORIGIN=http://domain-vps-anda
```

Frontend `.env`:
```env
VITE_API_URL=http://domain-vps-anda:3000/api
```

---

## Menjalankan Test

### Backend Test

```bash
cd /Users/macbookair/Desktop/damar-backend-betest/backend
npm test
```

### Frontend Test

```bash
cd /Users/macbookair/Desktop/damar-backend-betest/frontend
npm test
```

---

## Build untuk Production

### Backend

```bash
cd /Users/macbookair/Desktop/damar-backend-betest/backend
npm run build
npm run start:prod
```

### Frontend

```bash
cd /Users/macbookair/Desktop/damar-backend-betest/frontend
npm run build
npm run preview
```

---

## Catatan Penting

- **Environment variable `JWT_SECRET`** di backend wajib diganti dengan secret yang aman sebelum deploy ke production. Default dari `.env.example` hanya untuk development.
- **CORS_ORIGIN** default di backend adalah `http://localhost:5173` (frontend dev). Jika deploy ke VPS, sesuaikan dengan domain frontend.
- **MONGODB_URI** di Docker Compose sudah otomatis mengarah ke container `mongo`. Jika menjalankan manual, sesuaikan dengan URI MongoDB lokal.
