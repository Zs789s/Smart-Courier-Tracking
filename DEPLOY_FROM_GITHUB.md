# Smart Courier System - GitHub to Render Deployment

## 🚀 Deploy Your App in 5 Steps

### Step 1: Create GitHub Repository (2 minutes)

1. Go to **github.com**
2. Click **"New"** (top left)
3. Fill in:
   - **Repository name:** `smart-courier-system`
   - **Description:** Smart Courier System - Order Tracking
   - **Public** (so Render can access)
4. Click **"Create repository"**
5. Copy the commands shown

### Step 2: Push Code to GitHub (5 minutes)

In PowerShell, run these commands:

```powershell
cd c:\Users\Muaaz\Desktop\web-project

# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Deploy Smart Courier System"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/smart-courier-system.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**When prompted for password:**
- Use your GitHub personal access token (not password)
- Create at: https://github.com/settings/tokens

### Step 3: Deploy to Render (3 minutes)

1. Go to **render.com**
2. Click **"New +"** at top
3. Select **"Web Service"**
4. Click **"Connect"** for your repository
5. Authorize GitHub access
6. Select: `smart-courier-system` repo

**Configure:**
```
Name:                  smart-courier-system
Environment:           Node
Build Command:         npm install
Start Command:         node server.js
Plan:                  Free
```

Click **"Deploy"**

**Your app is now LIVE!** 🎉

### Step 4: Get Free Domain (5 minutes)

1. Go to **freenom.com**
2. Search: `smartcourier.tk`
3. Select **12 Months FREE**
4. Complete checkout
5. Click **"Manage Domain"**
6. Go to **"Nameservers"**
7. Replace with Render's nameservers:
   - Get them from Render dashboard
   - Settings → Custom Domain
   - Copy nameservers

### Step 5: Connect Domain (2 minutes)

In Render dashboard:
1. Go to **"Environment"**
2. Paste your Render nameservers into Freenom DNS
3. Add custom domain: `smartcourier.tk`

**Wait 24 hours for DNS propagation**

Then visit: **https://smartcourier.tk** ✅

---

## 🔑 Environment Variables Setup

In Render dashboard:

1. Go to **"Environment"**
2. Add these variables:
```
NODE_ENV=production
PORT=5000
DATABASE=data.sqlite
CORS_ORIGIN=https://smartcourier.tk
JWT_SECRET=your_very_secret_key_12345
```

3. Click **"Deploy"** to apply

---

## 📝 Files Needed in GitHub

Your repo should have:

```
smart-courier-system/
├── server.js
├── package.json
├── db-sqlite.js
├── migrate-db-sqlite.js
├── ecosystem.config.js
├── .gitignore
├── .env (locally only, not pushed)
├── *.html (all pages)
├── css/
│   ├── style.css
│   ├── track.css
│   └── ... (all CSS)
├── js/
│   ├── script.js
│   ├── track-ai.js
│   ├── chatbot.js
│   ├── indian-cities.js
│   └── ... (all JS)
└── db.json (sample data)
```

---

## ✅ Verify After Deployment

**Test your live app:**

```
✅ https://smartcourier-tk.onrender.com (Render URL)
✅ https://smartcourier.tk (Your domain - after DNS update)

Visit:
- /track.html
- /order-delivery.html
- /owner.html
- /login.html

Test API:
curl https://smartcourier-tk.onrender.com/api/orders
```

---

## 🔄 Update Your App (Auto Deploy)

Once connected to GitHub:

1. Make changes locally
2. Commit and push:
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```
3. Render **automatically deploys** within seconds! 🚀

---

## 💾 Database (SQLite)

⚠️ **Important:** Render's free tier uses ephemeral storage
- Data persists during session
- Lost when app spins down (after 15 min inactivity)

**Solution:**
Upgrade to paid tier ($7/month) for persistent storage

Or use Railway.app with 5GB free credit

---

## Render URL Format

After deployment, your app lives at:

```
https://smart-courier-system.onrender.com
```

You can customize subdomain in Settings → Custom Domain

---

## Troubleshooting

### App won't deploy
1. Check build logs in Render
2. Verify `npm install` works locally
3. Check Node version compatibility

### Database errors
1. Run migration locally first
2. Push updated code
3. Redeploy in Render

### Domain not working
1. Check nameservers updated (24h wait)
2. Verify custom domain added in Render
3. Test with Render's default URL first

---

## Free Limits

**Render Free Tier:**
- Spins down after 15 min inactivity (auto-resumes)
- 0.5 GB RAM
- No custom email
- Community support

**Freenom Domain:**
- 12 months free
- Then $2-8/year to renew

---

## Next: Paid Options

When you're ready to upgrade:

| Provider | Cost | Speed | Support |
|----------|------|-------|---------|
| Render Paid | $7+/mo | Fast | Priority |
| Railway | $5 credit/mo | Fast | Community |
| Namecheap | $36/yr | Good | 24/7 |

---

## Quick Commands Cheat Sheet

```bash
# First time setup
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/smart-courier-system.git
git push -u origin main

# After any changes
git add .
git commit -m "Your message"
git push origin main
# Render auto-deploys!

# Check status
git status
git log
```

---

**Your app is now deployed from GitHub! 🎉**

Every time you push to GitHub, Render automatically deploys your latest code!
