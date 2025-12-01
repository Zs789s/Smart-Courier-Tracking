# Deploy to Namecheap - Complete Guide

## Prerequisites
- Namecheap.com account
- Node.js hosting plan (or VPS)
- Domain name (already purchased or add new)

## Step 1: Set Up Namecheap Hosting

### Option A: Shared Hosting with Node.js Support
1. Log in to Namecheap.com
2. Go to **Hosting** → Select **Shared Hosting** or **Node.js Hosting**
3. Choose a plan and complete checkout
4. Go to **My Products** → **Manage** next to your hosting
5. Click **cPanel** to access control panel

### Option B: VPS (More Control)
1. Go to **VPS** → Select suitable plan
2. Configure and deploy
3. SSH access available

## Step 2: Access Your Hosting via cPanel

1. In cPanel, go to **File Manager**
2. Navigate to **public_html** folder
3. Upload your project files here (except node_modules)

## Step 3: Deploy Application

### Via FTP (Easiest)
```bash
# Download FileZilla or WinSCP
# Connect using credentials from cPanel:
# Host: ftp.yourdomain.com
# Username: cpanel_username
# Password: cPanel password
# Port: 21

# Upload all files except:
# - node_modules/
# - data.sqlite (will be created on server)
```

### Via SSH (Advanced)
```bash
ssh username@yourdomain.com

# Navigate to public_html
cd public_html

# Clone or upload your project
git clone your-repo.git
# OR upload via SFTP

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
NODE_ENV=production
PORT=3000
DATABASE=data.sqlite
EOF

# Start application
npm start

# Or use PM2 for persistent running
npm install -g pm2
pm2 start server.js --name "courier-system"
pm2 save
```

## Step 4: Configure Namecheap Domain

1. In cPanel, go to **Addon Domains** or **Parked Domains**
2. Add your domain and point to public_html folder
3. Wait for DNS propagation (5-30 minutes)

## Step 5: Enable SSL Certificate

1. In cPanel, find **AutoSSL** or **Let's Encrypt SSL**
2. Install free SSL certificate
3. Update server.js to redirect HTTP to HTTPS

```javascript
const https = require('https');
const fs = require('fs');

// Add to server.js:
if (process.env.NODE_ENV === 'production') {
    const options = {
        key: fs.readFileSync('/path/to/private.key'),
        cert: fs.readFileSync('/path/to/certificate.crt')
    };
    https.createServer(options, app).listen(443);
}
```

## Step 6: Set Up Database

1. **SQLite** (Current setup - works on Namecheap)
   - data.sqlite will be created automatically on first run
   - Make sure `public_html` folder is writable

2. **MySQL** (Alternative - better for production)
   - In cPanel, go to **MySQL Databases**
   - Create new database
   - Update connection in server.js

## Step 7: Keep Application Running

### Option 1: cPanel Node.js Manager
1. In cPanel, look for **Node.js Manager** or **Application Manager**
2. Create new Node.js application
3. Set Entry Point: `server.js`
4. Confirm port is available

### Option 2: PM2 Daemon
```bash
pm2 start server.js --name "courier-app"
pm2 startup
pm2 save
```

## Environment Variables (.env)
```
NODE_ENV=production
PORT=5000
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=https://yourdomain.com
```

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process
lsof -i :5000
kill -9 <PID>
```

### Database Errors
```bash
# Re-run migration on server
ssh username@yourdomain.com
cd public_html
node migrate-db-sqlite.js
```

### Static Files Not Loading
- Ensure CSS, JS, HTML files are in correct folders
- Check folder permissions (755 for folders, 644 for files)

### Node.js Not Starting
- Check error logs in cPanel
- Verify Node.js version compatibility
- Test locally first

## Testing Your Deployment

1. Visit `https://yourdomain.com/track.html`
2. Visit `https://yourdomain.com/order-delivery.html`
3. Test API: `https://yourdomain.com/api/orders`
4. Verify database: Check if `data.sqlite` was created

## Final Checklist

- [ ] Domain points to public_html
- [ ] SSL certificate installed
- [ ] Node.js application running (PM2 or cPanel Manager)
- [ ] node_modules installed on server
- [ ] Database migrated
- [ ] Ports correctly configured
- [ ] CORS settings updated for production
- [ ] Environment variables set
- [ ] Static files accessible
- [ ] API endpoints working

## Support

For Namecheap support:
- Live chat: namecheap.com (bottom right)
- Tickets: support.namecheap.com
- Documentation: namecheap.com/hosting/node-js-hosting/

---

**Need Help?** Contact Namecheap support or check error logs in cPanel.
