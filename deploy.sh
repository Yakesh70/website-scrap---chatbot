#!/bin/bash

echo "🚀 Deploying Web Bot to Vercel..."

# Deploy backend
echo "📦 Deploying backend..."
cd server
vercel --prod
cd ..

# Deploy frontend
echo "🎨 Deploying frontend..."
cd client
vercel --prod
cd ..

echo "✅ Deployment complete!"
echo "📝 Don't forget to:"
echo "   1. Set environment variables in Vercel dashboard"
echo "   2. Update API URLs if needed"
echo "   3. Test the deployed application"