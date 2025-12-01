# Namecheap Deployment Guide - Smart Courier System

## Quick Start - Deploy in 5 Steps

### Step 1: Purchase Namecheap Hosting
1. Go to **namecheap.com**
2. Search: "Node.js Hosting" or "Shared Hosting"
3. Choose a plan ($2.99/month or higher)
4. Complete purchase
5. Get FTP/SSH credentials from email

### Step 2: Prepare Your Project
```powershell
# In your project folder
npm install

# Run database migration
node migrate-db-sqlite.js

# Verify it works locally
npm start
# Visit http://localhost:5000
```

### Step 3: Upload to Namecheap via FTP

**Download FileZilla:** https://filezilla-project.org/

**Connect:**
- Host: `ftp.yourdomain.com`
- Username: `cPanel_username@yourdomain.com`
- Password: (from Namecheap email)
- Port: `21`

**Upload These Files to `public_html`:**
- server.js
- package.json
- db-sqlite.js
- migrate-db-sqlite.js
- All HTML files (track.html, order-delivery.html, etc.)
- css/ folder (all CSS files)
- js/ folder (all JavaScript files)

**DO NOT UPLOAD:**
- node_modules/
- data.sqlite
- .git/
- *.bak files

### Step 4: Set Up on Namecheap Server

**Via SSH (Best Method):**
```bash
# Connect
ssh cPanel_username@yourdomain.com

# Navigate
cd public_html

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
NODE_ENV=production
PORT=5000
DATABASE=data.sqlite
CORS_ORIGIN=https://yourdomain.com
JWT_SECRET=your_secret_key_here
EOF

# Run migration
node migrate-db-sqlite.js

# Start with PM2 (recommended for persistent running)
npm install -g pm2
pm2 start server.js --name "courier-app"
pm2 startup
pm2 save
```

### Step 5: Configure Domain & SSL

1. In cPanel → **Addon Domains** → Add yourdomain.com
2. In cPanel → **AutoSSL** → Install free SSL certificate
3. Wait 15-30 minutes for DNS propagation
4. Visit `https://yourdomain.com` ✅

---

## Detailed Setup Guide

### Prerequisites
- Namecheap account
- Domain name (purchased)
- Node.js hosting plan (at least shared hosting)
- FTP/SSH access to hosting

### Option A: FTP Upload (Easiest for Beginners)

1. **Download FileZilla**
   - Go to https://filezilla-project.org/download.php
   - Install on your computer

2. **Get FTP Credentials**
   - Log in to namecheap.com
   - Go to Services → Hosting → Manage
   - Look for FTP/SSH section
   - Username: cpanel_username
   - Password: (in email or reset)
   - Host: yourdomain.com or your.ip.address

3. **Connect FileZilla**
   - File → Site Manager → New site
   - Host: ftp.yourdomain.com
   - Port: 21
   - User: cPanel_username@yourdomain.com
   - Password: (your password)
   - Click Connect

4. **Upload Files**
   - Right side: Navigate to public_html
   - Left side: Your project folder
   - Drag these files to public_html:
     ```
     server.js
     package.json
     db-sqlite.js
     migrate-db-sqlite.js
     All .html files
     css/ folder
     js/ folder
     ```

5. **Upload node_modules via SSH** (see Option B)

### Option B: SSH Upload (Recommended)

1. **Install SSH Client**
   - Windows: Use PuTTY or Windows Terminal
   - Mac/Linux: Built-in terminal

2. **Connect via SSH**
   ```bash
   ssh cPanel_username@yourdomain.com
   ```
   - Enter password when prompted

3. **Navigate to public_html**
   ```bash
   cd public_html
   ```

4. **Upload using SCP (Secure Copy)**
   ```bash
   # From your local machine
   scp -r C:\path\to\project\* cPanel_username@yourdomain.com:~/public_html/
   ```

5. **On Server: Install Dependencies**
   ```bash
   cd public_html
   npm install
   ```

6. **Create Configuration**
   ```bash
   cat > .env << EOF
   NODE_ENV=production
   PORT=5000
   DATABASE=data.sqlite
   CORS_ORIGIN=https://yourdomain.com
   EOF
   ```

7. **Initialize Database**
   ```bash
   node migrate-db-sqlite.js
   ```

8. **Start Application**
   ```bash
   npm start
   # Or use PM2 for background running:
   pm2 start server.js --name "courier"
   ```

---

## cPanel Configuration

### Access cPanel
1. Log in to namecheap.com
2. My Products → Hosting → Manage
3. Click cPanel button

### Configure Application (Method 1: Node.js Manager)
1. Find **"Node.js Manager"** in cPanel
2. Create New Application:
   - Domain: yourdomain.com
   - Node.js Version: 14.x or higher
   - Application Root: public_html
   - Entry Point: server.js
   - Port: 5000
3. Click Create

### Configure Application (Method 2: PM2 + Supervisor)
1. SSH into server
2. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```
3. Start your app:
   ```bash
   pm2 start server.js --name "courier-system"
   pm2 startup
   pm2 save
   ```
4. This will auto-restart on reboot

### Install SSL Certificate
1. In cPanel, find **"AutoSSL"** or **"Let's Encrypt SSL"**
2. Click Install for yourdomain.com
3. Wait 5-10 minutes
4. Verify: Visit https://yourdomain.com (should show 🔒 padlock)

---

## Testing Deployment

### Test Pages Load
```bash
# After deployment, visit:
https://yourdomain.com/track.html
https://yourdomain.com/order-delivery.html
https://yourdomain.com/owner.html
https://yourdomain.com/login.html
```

### Test API
```bash
curl https://yourdomain.com/api/orders
# Should return JSON

curl https://yourdomain.com/api/track/SCS1234567
# Should return order details or 404
```

### Test Database
- Create an order via `/order-delivery.html`
- Track it via `/track.html`
- Verify data is saved

---

## Troubleshooting

### Issue: "Cannot find module 'express'"
**Cause:** node_modules not installed

**Fix:**
```bash
ssh cPanel_username@yourdomain.com
cd public_html
npm install
```

### Issue: Port 5000 Already in Use
**Cause:** Another process using the port

**Fix:**
```bash
lsof -i :5000
kill -9 <PID>
npm start
```

### Issue: Database Locked Error
**Cause:** SQLite database conflict

**Fix:**
```bash
rm data.sqlite
node migrate-db-sqlite.js
```

### Issue: CSS/JS Files Not Loading
**Cause:** Incorrect file paths

**Fix:**
1. Check file permissions: `chmod 644 css/*.css js/*.js`
2. Verify folder structure matches
3. Use relative paths in HTML

### Issue: CORS Errors
**Cause:** Origin mismatch

**Fix:**
```bash
# Update .env
CORS_ORIGIN=https://yourdomain.com

# Restart app
pm2 restart all
```

### Issue: 502 Bad Gateway
**Cause:** Application crashed or not running

**Fix:**
```bash
# Check if running
pm2 list

# Check logs
pm2 logs

# Restart
pm2 restart all
```

---

## Performance Tips

1. **Use PM2 for Clustering**
   ```bash
   pm2 start server.js -i max  # Use all CPU cores
   ```

2. **Enable Compression**
   ```bash
   npm install compression
   # Add to server.js:
   const compression = require('compression');
   app.use(compression());
   ```

3. **Monitor Resources**
   ```bash
   pm2 monit  # Real-time monitoring
   ```

4. **Backup Database**
   ```bash
   scp cPanel_username@yourdomain.com:~/public_html/data.sqlite ./backup/
   ```

---

## Maintenance

### Update Dependencies
```bash
npm update
pm2 restart all
```

### Monitor Application
```bash
pm2 logs
pm2 status
pm2 monit
```

### Restart Service
```bash
pm2 restart all
# Or via cPanel Node.js Manager
```

### Backup Database
- Weekly: Download data.sqlite via FTP
- Keep 4-week rolling backup

---

## File Structure on Namecheap

```
public_html/
├── server.js                      (Main app)
├── package.json                   (Dependencies)
├── package-lock.json              (Lock file)
├── db-sqlite.js                   (Database config)
├── migrate-db-sqlite.js           (Migrations)
├── .env                           (Secrets)
├── ecosystem.config.js            (PM2 config)
├── data.sqlite                    (Database - auto created)
├── logs/                          (Auto created)
│   ├── error.log
│   └── output.log
├── node_modules/                  (Installed by npm)
├── css/
│   ├── style.css
│   ├── track.css
│   ├── owner.css
│   └── ... (all CSS)
├── js/
│   ├── script.js
│   ├── track-ai.js
│   ├── chatbot.js
│   ├── indian-cities.js
│   └── ... (all JS)
├── index.html
├── track.html
├── order-delivery.html
├── owner.html
├── landing.html
├── login.html
├── signup.html
├── user.html
└── ... (all HTML files)
```

---

## Support

- **Namecheap Support:** https://support.namecheap.com
- **Live Chat:** namecheap.com (bottom right)
- **Node.js Docs:** https://nodejs.org/docs/
- **Express.js:** https://expressjs.com/

**Status:** ⏳ PENDING (waiting for your action)
**Last Updated:** December 1, 2025

In Render dashboard, go to "Environment" and add:

```
PORT=3000
JWT_SECRET=your-secure-random-key-here
DATABASE_URL=postgresql://user:pass@host/dbname
```

For **DATABASE_URL**, use either:
- **Option A**: Render's PostgreSQL (free, limited)
- **Option B**: PostgreSQL or MongoDB Atlas (better for production)
- **Option C**: Keep SQLite (local data.sqlite fallback)

### 5. Monitor Deployment
After clicking "Create Web Service":
- Render will clone your repo
- Install npm dependencies
- Start your Node.js server
- Provide a public URL: `https://smart-courier-system.onrender.com`
- Check deployment logs if any errors occur

## 📋 Project Status

**Current State:**
- Server code: ✅ Production-ready
- Database: ✅ Supports PostgreSQL + SQLite fallback
- API: ✅ All endpoints implemented and tested
- Frontend: ✅ All pages responsive and styled
- Git: ✅ Code committed, ready to push

**What's Working Locally:**
- Running on `http://localhost:5000`
- All features tested
- Order deletion fixed
- User accounts functional
- JWT authentication active

## 🚀 Next Steps (For You)

1. **Visit**: https://github.com/new (create repo)
2. **Run**: `git push origin main` (push code)
3. **Visit**: https://render.com (deploy)
4. **Configure**: Environment variables
5. **Test**: Your live URL

## 📞 Troubleshooting

**If push fails**: Make sure GitHub repo is created and set to Public

**If Render deployment fails**: Check build logs for missing dependencies

**If app won't start**: Verify DATABASE_URL and JWT_SECRET are set correctly

**Port issues**: Render assigns port via $PORT env var (already handled in server.js)

---

**Your app is ready to go live! Just follow the steps above.** 🎉
