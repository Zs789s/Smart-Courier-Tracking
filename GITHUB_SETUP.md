# GitHub & Render Deployment Setup

## Step 1: Create GitHub Repository (Manual)

1. Go to https://github.com/new
2. Create a new repository with these settings:
   - **Repository name**: `my-web-project`
   - **Description**: Smart Courier System - Web Application
   - **Public/Private**: Public (needed for Render)
   - **Initialize**: Do NOT add README, .gitignore, or license (we have our own)
3. Click "Create repository"

## Step 2: Push Code to GitHub

After creating the repo, run this command:

```powershell
cd c:\Users\Muaaz\Desktop\web-project
git push origin main
```

This will push all your commits to GitHub.

## Step 3: Create Render Web Service

1. Go to https://render.com
2. Sign in with your GitHub account (connect if needed)
3. Click "New +" → "Web Service"
4. Select the `my-web-project` repository
5. Configure:
   - **Name**: `smart-courier-system` (or any unique name)
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

## Step 4: Add Environment Variables

In the Render dashboard for your service:

1. Go to "Environment"
2. Add these variables:
   - **PORT**: `3000` (or leave blank for default)
   - **DATABASE_URL**: Your PostgreSQL connection string (PostgreSQL URL from Render or external)
   - **JWT_SECRET**: `your-secure-secret-key-here`

## Step 5: Deploy

Click "Create Web Service" and Render will automatically:
- Clone your repo
- Install dependencies
- Build and start your app
- Provide a live URL like `https://smart-courier-system.onrender.com`

## Optional: PostgreSQL Database

Instead of SQLite, you can use Render's PostgreSQL:

1. In Render dashboard, go to "PostgreSQL" 
2. Create a free PostgreSQL database
3. Copy the connection string
4. Set it as DATABASE_URL in your web service environment

---

**Your repo is ready to push!** Just follow the steps above to get live.
