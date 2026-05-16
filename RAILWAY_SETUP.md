# Railway Deployment Setup Guide

## Step 1: Create Railway Project
1. Go to [railway.app](https://railway.app) and sign up/login
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `planet-mini` repository
4. Railway will automatically detect the Node.js project

## Step 2: Add Environment Variables
In your Railway project, go to "Variables" tab and add these variables:

### Required Environment Variables:
- `DATABASE_URL` - Your MongoDB connection string
- `GOOGLE_CLIENT_ID` - Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Your Google OAuth client secret
- `JWT_SECRET` - Your JWT secret key
- `SESSION_SECRET` - Your session secret
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
- `RAZORPAY_KEY_ID` - Your Razorpay key ID
- `RAZORPAY_KEY_SECRET` - Your Razorpay key secret
- `FRONTEND_URL` - Your Vercel frontend URL (e.g., https://planet-mini.vercel.app)
- `NODE_ENV` - Set to `production`
- `PORT` - Set to `5001` (or any port you prefer)

## Step 3: Deploy
1. Click "Deploy" in Railway
2. Wait for the build to complete
3. Railway will provide a URL for your backend (e.g., https://your-backend.up.railway.app)

## Step 4: Update Frontend Configuration
After deployment, update your frontend to use the new Railway backend URL:
- Replace all API calls to use the Railway backend URL
- Update CORS configuration if needed

## Step 5: Clean Up
- Remove the `api/` directory (no longer needed)
- Update `vercel.json` for frontend-only deployment
- Redeploy frontend to Vercel
