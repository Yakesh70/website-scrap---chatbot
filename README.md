# Web Bot - RAG Chatbot with Web Scraping

A full-stack application that scrapes websites, extracts anchor tags, and creates a RAG chatbot trained on the scraped content.

## Features

- User authentication with Clerk
- Website link upload and scraping
- Anchor tag extraction (max 15, no duplicates)
- Content scraping from anchor tag URLs
- RAG chatbot using Gemini Flash and Pinecone
- MongoDB for data storage

## Tech Stack

**Frontend:**
- React + Vite
- Tailwind CSS
- Clerk Authentication
- Axios

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Cheerio + Axios (scraping)
- Pinecone (vector database)
- Gemini Flash (LLM)

## Setup

1. Install dependencies:
```bash
npm install
cd server && npm install
cd ../client && npm install
```

2. Set up environment variables in `.env`

3. Start development:
```bash
npm run dev
```

## API Endpoints

- `POST /api/auth/register` - Register user
- `GET /api/auth/me` - Get user info
- `POST /api/links/upload` - Upload and scrape website
- `GET /api/links/:id` - Get scraped links
- `POST /api/rag/train/:linkId` - Train RAG model
- `POST /api/rag/query` - Query chatbot