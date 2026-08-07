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
