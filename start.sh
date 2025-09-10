#!/bin/bash

echo "🚀 Starting Web Bot Application..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB not running. Please start MongoDB first:"
    echo "   brew services start mongodb-community"
    echo "   or"
    echo "   mongod --dbpath /usr/local/var/mongodb"
    exit 1
fi

echo "✅ MongoDB is running"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing root dependencies..."
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
fi

# Fix permissions
chmod +x server/node_modules/.bin/* 2>/dev/null || true
chmod +x client/node_modules/.bin/* 2>/dev/null || true

echo "🎯 Starting development servers..."
npm run dev