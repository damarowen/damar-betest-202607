#!/bin/bash

set -e

PROJECT_DIR="/Users/macbookair/Desktop/damar-backend-betest"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "========================================="
echo "  Damar Backend Betest - Local Runner"
echo "  (No Docker - all services on host)"
echo "========================================="
echo ""

# Cek prerequisites lokal
check_services() {
  echo "[1/4] Checking local prerequisites..."

  # Cek Node.js
  if ! command -v node &> /dev/null; then
    echo "  ✗ Node.js not found. Please install Node.js 20+ first."
    exit 1
  fi
  NODE_VERSION=$(node -v)
  echo "  ✓ Node.js $NODE_VERSION"

  # Cek MongoDB
  if ! command -v mongod &> /dev/null && ! command -v mongosh &> /dev/null; then
    echo "  ✗ MongoDB not found. Please install MongoDB locally."
    echo "    brew tap mongodb/brew && brew install mongodb-community"
    exit 1
  fi
  echo "  ✓ MongoDB found"

  # Cek Redis
  if ! command -v redis-cli &> /dev/null; then
    echo "  ✗ Redis not found. Please install Redis locally."
    echo "    brew install redis"
    exit 1
  fi
  echo "  ✓ Redis found"
}

# Pastikan MongoDB dan Redis berjalan
start_infra() {
  echo "[2/4] Starting MongoDB and Redis..."

  # Cek & start MongoDB
  if mongosh --eval "db.runCommand({ping:1})" --quiet 2>/dev/null; then
    echo "  ✓ MongoDB already running"
  else
    echo "  Starting MongoDB..."
    if command -v brew &> /dev/null; then
      brew services start mongodb-community 2>/dev/null || mongod --fork --dbpath /usr/local/var/mongodb --logpath /usr/local/var/log/mongodb.log
    else
      mongod --fork --dbpath /data/db --logpath /tmp/mongodb.log
    fi
    sleep 2
    if mongosh --eval "db.runCommand({ping:1})" --quiet 2>/dev/null; then
      echo "  ✓ MongoDB started on port 27017"
    else
      echo "  ✗ Failed to start MongoDB. Please start manually: mongod --dbpath /usr/local/var/mongodb"
      exit 1
    fi
  fi

  # Cek & start Redis
  if redis-cli ping 2>/dev/null | grep -q PONG; then
    echo "  ✓ Redis already running"
  else
    echo "  Starting Redis..."
    if command -v brew &> /dev/null; then
      brew services start redis 2>/dev/null || redis-server --daemonize yes
    else
      redis-server --daemonize yes
    fi
    sleep 1
    if redis-cli ping 2>/dev/null | grep -q PONG; then
      echo "  ✓ Redis started on port 6379"
    else
      echo "  ✗ Failed to start Redis. Please start manually: redis-server --daemonize yes"
      exit 1
    fi
  fi
}

# Setup backend
setup_backend() {
  echo "[3/4] Setting up backend..."

  cd "$BACKEND_DIR"

  if [ ! -f .env ]; then
    cp .env.example .env
    echo "  ✓ Created .env from .env.example"
  else
    echo "  ✓ .env already exists"
  fi

  if [ ! -d node_modules ]; then
    echo "  Installing backend dependencies..."
    npm install
  else
    echo "  ✓ node_modules already installed"
  fi

  echo "  Running seed..."
  npx ts-node src/seed.ts 2>&1 | grep -E "Created|Seed|Username|Password|Skipping" || true
}

# Setup frontend
setup_frontend() {
  echo "[4/4] Setting up frontend..."

  cd "$FRONTEND_DIR"

  if [ ! -f .env ]; then
    cp .env.example .env
    echo "  ✓ Created .env from .env.example"
  else
    echo "  ✓ .env already exists"
  fi

  if [ ! -d node_modules ]; then
    echo "  Installing frontend dependencies..."
    npm install
  else
    echo "  ✓ node_modules already installed"
  fi
}

# Jalankan backend dan frontend
run_services() {
  echo ""
  echo "========================================="
  echo "  Starting services..."
  echo "========================================="
  echo ""

  # Trap untuk cleanup
  cleanup() {
    echo ""
    echo "Shutting down backend and frontend..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "Services stopped. MongoDB and Redis still running."
    echo "To stop them: brew services stop mongodb-community redis"
    exit 0
  }
  trap cleanup SIGINT SIGTERM

  # Start backend
  cd "$BACKEND_DIR"
  npm run start:dev &
  BACKEND_PID=$!
  echo "  ✓ Backend started (PID: $BACKEND_PID)"

  # Tunggu backend siap
  echo "  Waiting for backend..."
  sleep 4

  # Start frontend
  cd "$FRONTEND_DIR"
  npm run dev &
  FRONTEND_PID=$!
  echo "  ✓ Frontend started (PID: $FRONTEND_PID)"

  echo ""
  echo "========================================="
  echo "  All services running!"
  echo ""
  echo "  Frontend:  http://localhost:5173"
  echo "  Backend:   http://localhost:3000/api"
  echo "  Swagger:   http://localhost:3000/api/docs"
  echo "  MongoDB:   localhost:27017"
  echo "  Redis:     localhost:6379"
  echo "========================================="
  echo ""
  echo "Press Ctrl+C to stop."
  echo ""

  wait
}

# Main
check_services
start_infra
setup_backend
setup_frontend
run_services
