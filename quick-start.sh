#!/bin/bash

# CivicSense - Quick Start Script
# This script sets up the development environment

set -e

echo "🚀 CivicSense Quick Start Setup"
echo "================================"

# Check prerequisites
echo "✓ Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

if ! command -v mongodb &> /dev/null; then
    echo "⚠️  MongoDB not found. Using Docker MongoDB instead"
    MONGODB_METHOD="docker"
else
    MONGODB_METHOD="local"
fi

# Create environment files
echo "✓ Setting up environment files..."

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "📝 Created backend/.env - Please update with your credentials"
fi

if [ ! -f "frontend/.env.local" ]; then
    cat > frontend/.env.local <<EOF
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
EOF
    echo "📝 Created frontend/.env.local"
fi

# Install dependencies
echo "✓ Installing dependencies..."
cd backend
npm install
cd ..

cd frontend
npm install
cd ..

# Start services
echo ""
echo "================================"
echo "🎯 Setup Complete!"
echo "================================"
echo ""
echo "To start development:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend"
echo "  npm run dev"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Access the application at:"
echo "  http://localhost:5173"
echo ""
echo "📧 Email Configuration:"
echo "  1. Edit backend/.env"
echo "  2. Add EMAIL_USER and EMAIL_PASS"
echo "  3. Follow guide: https://myaccount.google.com/apppasswords"
echo ""
echo "🐳 Or use Docker:"
echo "  docker-compose -f docker-compose.dev.yml up"
echo ""
echo "✅ Happy coding!"
