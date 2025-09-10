# Vercel Deployment Guide

## Prerequisites

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

## Step-by-Step Deployment

### 1. Deploy Backend (Server)

```bash
cd server
vercel --prod
```

**Important**: Note the deployed URL (e.g., `https://your-app-server.vercel.app`)

### 2. Update Client API URL

Update `/client/src/services/api.js`:
```javascript
const api = axios.create({
  baseURL: import.meta.env.PROD 
    ? 'https://YOUR-BACKEND-URL.vercel.app/api'  // Replace with your backend URL
    : '/api'
})
```

### 3. Deploy Frontend (Client)

```bash
cd client
vercel --prod
```

### 4. Set Environment Variables

In Vercel Dashboard for **backend**:
- `MONGODB_URI` - Your MongoDB connection string
- `CLERK_SECRET_KEY` - Your Clerk secret key
- `GEMINI_API_KEY` - Your Gemini API key
- `NODE_ENV` - `production`

In Vercel Dashboard for **frontend**:
- `VITE_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key

## Quick Deploy (Automated)

```bash
./deploy.sh
```

## MongoDB Setup for Production

### Option 1: MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create cluster
3. Get connection string
4. Add to Vercel environment variables

### Option 2: Railway/PlanetScale
Alternative database hosting options

## Environment Variables Checklist

### Backend (.env)
- ✅ `MONGODB_URI`
- ✅ `CLERK_SECRET_KEY`
- ✅ `GEMINI_API_KEY`
- ✅ `NODE_ENV=production`

### Frontend (.env)
- ✅ `VITE_CLERK_PUBLISHABLE_KEY`

## Testing Deployment

1. **Backend Health Check**
   - Visit: `https://your-backend.vercel.app/api/health`
   - Should return: `{"status":"OK","timestamp":"..."}`

2. **Frontend**
   - Visit your frontend URL
   - Test login functionality
   - Test website upload
   - Test chat functionality

## Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Update CORS origins in `server.js`
   - Add your frontend URL to allowed origins

2. **API Not Found**
   - Check API URL in client configuration
   - Verify backend deployment

3. **Database Connection**
   - Verify MongoDB URI
   - Check network access in MongoDB Atlas

4. **Authentication Issues**
   - Verify Clerk keys
   - Check domain settings in Clerk dashboard

## Post-Deployment

1. Update Clerk dashboard with production URLs
2. Test all functionality
3. Monitor logs in Vercel dashboard
4. Set up custom domains (optional)

## Useful Commands

```bash
# Check deployment status
vercel ls

# View logs
vercel logs

# Remove deployment
vercel rm

# Link local project to Vercel
vercel link
```