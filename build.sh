#!/bin/bash
set -e

# Determine project root
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

# Install backend dependencies
npm install --prefix backend

# Generate Prisma client
(cd backend && npx prisma generate)

# Install frontend dependencies
npm install --prefix frontend

# Build frontend
npm run build --prefix frontend
