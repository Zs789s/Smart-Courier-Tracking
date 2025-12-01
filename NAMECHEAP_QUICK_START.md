# Namecheap Deployment - Quick Reference

## TL;DR - Deploy in 5 Minutes

```bash
# 1. Local Testing
npm install
node migrate-db-sqlite.js
npm start
# Visit http://localhost:5000 ✅

# 2. Upload via FTP/SSH
# Use FileZilla or SCP to upload:
# - *.html, *.js, *.json files
# - css/ and js/ folders
# - DO NOT upload node_modules/ or data.sqlite

# 3. On Namecheap Server
npm install
node migrate-db-sqlite.js
pm2 start server.js

# 4. Configure Domain
# In cPanel: Addon Domains → yourdomain.com

# 5. Enable SSL
# In cPanel: AutoSSL → Install

# Done! Visit https://yourdomain.com ✅
```

## Essential Commands

```bash
# SSH Connect
ssh cpanel_username@yourdomain.com

# Navigate to App
cd public_html

# Install Dependencies
npm install

# Initialize Database
node migrate-db-sqlite.js

# Start App
npm start

# Background with PM2
pm2 start server.js --name "courier"
pm2 startup
pm2 save

# View Logs
pm2 logs

# Monitor
pm2 monit

# Restart
pm2 restart all

# Stop
pm2 stop all
```

## Key Files to Upload

```
✅ server.js
✅ package.json
✅ db-sqlite.js
✅ migrate-db-sqlite.js
✅ *.html (all HTML files)
✅ css/ (entire folder)
✅ js/ (entire folder)

❌ node_modules/ (run: npm install on server)
❌ data.sqlite (auto-created)
❌ .git/ folder
```

## Environment File (.env)

```
NODE_ENV=production
PORT=5000
DATABASE=data.sqlite
CORS_ORIGIN=https://yourdomain.com
JWT_SECRET=your_secret_key_here
```

## Test Your Deployment

```bash
# Check if running
pm2 list

# Check API
curl https://yourdomain.com/api/orders

# Check pages
# Visit: https://yourdomain.com/track.html
# Visit: https://yourdomain.com/order-delivery.html
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port in use | `lsof -i :5000` then `kill -9 <PID>` |
| Missing modules | `npm install` |
| Database error | `rm data.sqlite` then `node migrate-db-sqlite.js` |
| 404 errors | Check file permissions: `chmod 644` |
| App won't start | Check `pm2 logs` for errors |
| CORS blocked | Update `CORS_ORIGIN` in .env |

## Support Links

- **Namecheap:** namecheap.com/support
- **Node.js:** nodejs.org
- **Express:** expressjs.com
- **PM2:** pm2.keymetrics.io

---

**Created:** December 1, 2025
**Project:** Smart Courier System
**Hosting:** Namecheap (Node.js)
