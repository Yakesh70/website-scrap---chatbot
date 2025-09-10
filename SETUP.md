# Web Bot Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MongoDB** (local or cloud)
3. **API Keys** (already configured in .env)

## Quick Start

### Option 1: Use the startup script
```bash
./start.sh
```

### Option 2: Manual start
```bash
# Install dependencies
npm install
cd server && npm install && cd ../client && npm install && cd ..

# Fix permissions (if needed)
chmod +x server/node_modules/.bin/* client/node_modules/.bin/*

# Start both servers
npm run dev
```

## MongoDB Setup

### Local MongoDB (Recommended for development)
```bash
# Install MongoDB (macOS)
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Or start manually
mongod --dbpath /usr/local/var/mongodb
```

### MongoDB Atlas (Cloud)
Update `.env` with your Atlas connection string:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/web_bot
```

## Access the Application

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **API Health**: http://localhost:5000/api/health

## Troubleshooting

### Permission Issues
```bash
chmod +x server/node_modules/.bin/* client/node_modules/.bin/*
```

### MongoDB Connection Issues
- Check if MongoDB is running: `brew services list | grep mongodb`
- Check connection string in `.env`
- Ensure database name is correct

### Port Conflicts
- Frontend runs on port 5173 (Vite default)
- Backend runs on port 5000
- Change ports in `vite.config.js` and `server.js` if needed

## Features Working

✅ User Authentication (Clerk)
✅ Website Scraping
✅ Anchor Tag Extraction
✅ Content Storage
✅ RAG Chatbot (Gemini + MongoDB Vector Storage)
✅ Responsive UI

## API Endpoints

- `POST /api/links/upload` - Upload and scrape website
- `GET /api/links` - Get user's scraped links
- `GET /api/links/:id` - Get specific link data
- `POST /api/rag/train/:linkId` - Train RAG model
- `POST /api/rag/query/:linkId` - Query chatbot