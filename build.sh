#!/bin/bash
set -e

# Install backend dependencies
npm install --prefix backend

# Generate Prisma client
cd backend
npx prisma generate
cd ..

# Install frontend dependencies
npm install --prefix frontend

# Build frontend
npm run build --prefix frontend
