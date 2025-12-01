# 🚀 Deploy Smart Courier System to Heroku

**Time: 10 minutes | Cost: ~$7/month (FREE tier removed)**

---

## **⚠️ Important Note**

Heroku removed their free tier in late 2022. Cheapest plan is now **$7/month** (Eco Dyno).

If you want **free hosting**, use **Render** or **Railway** instead.

---

## **Step-by-Step Deployment**

### **Step 1: Install Heroku CLI**

Download from: https://devcenter.heroku.com/articles/heroku-cli

For Windows:
```powershell
# Using Chocolatey (if installed)
choco install heroku-cli

# Or download installer from:
# https://cli-assets.heroku.com/branches/main/heroku-windows-x64.exe
```

Verify installation:
```bash
heroku --version
```

---

### **Step 2: Create Procfile**

Heroku needs a `Procfile` to know how to start your app.

In your project root, create file: `Procfile`

Add this content:
```
web: node server.js
```

Then commit:
```bash
git add Procfile
git commit -m "Add Procfile for Heroku"
git push origin main
```

---

### **Step 3: Login to Heroku**

```bash
heroku login
```

This opens browser to authenticate. Sign in or create free account.

---

### **Step 4: Create Heroku App**

```bash
# From your project directory:
cd c:\Users\Muaaz\Desktop\web-project

# Create app
heroku create smart-courier-system

# Check if created:
heroku apps
```

You should see:
```
smart-courier-system   https://smart-courier-system.herokuapp.com/
```

---

### **Step 5: Set Environment Variables (Optional)**

```bash
heroku config:set NODE_ENV=production
heroku config:set PORT=5000
```

View them:
```bash
heroku config
```

---

### **Step 6: Deploy from Git**

```bash
git push heroku main
```

This will:
1. Upload code to Heroku
2. Install dependencies (npm install)
3. Build your app
4. Start the server

Watch for:
```
Deployed to Heroku
```

---

### **Step 7: View Your App**

```bash
heroku open
```

Or visit manually:
```
https://smart-courier-system.herokuapp.com
```

---

### **Step 8: Check Logs**

If something goes wrong:
```bash
heroku logs --tail
```

This shows real-time server logs.

---

## **🔄 Redeploy After Changes**

Every time you update code:

```bash
git add .
git commit -m "Your changes"
git push origin main    # Push to GitHub
git push heroku main    # Deploy to Heroku
```

---

## **✨ Features Working on Heroku**

✅ Order creation & tracking
✅ India map display
✅ GPS location detection
✅ City selector
✅ User login/signup
✅ Admin panel
✅ AI chatbot
✅ Mobile responsive
✅ Database persistence (SQLite in /tmp - ephemeral)

⚠️ **Database Note:** SQLite data resets when Heroku restarts (about daily).
For production, upgrade to PostgreSQL add-on (~$9/month).

---

## **💾 Add PostgreSQL Database (Optional)**

For persistent data:

```bash
# Add PostgreSQL
heroku addons:create heroku-postgresql:basic

# View connection:
heroku config | grep DATABASE_URL
```

Then update `server.js` to use PostgreSQL instead of SQLite.

---

## **📊 Monitor Your App**

### View Metrics:
```bash
heroku metrics
```

### View Config:
```bash
heroku config
```

### Restart App:
```bash
heroku restart
```

### Scale Dynos (Performance):
```bash
heroku ps:scale web=1
```

---

## **🆘 Troubleshooting**

### App won't start
```bash
heroku logs --tail
# Read error message and fix in local code
# Then git push heroku main again
```

### "Application Error"
```bash
# Check if Procfile exists and is correct
# Check if server.js works locally first:
npm start

# Then push to Heroku
```

### Port issues
```bash
# Heroku assigns PORT dynamically
# Make sure server.js uses:
const PORT = process.env.PORT || 5000;
app.listen(PORT, ...);
```

### Database issues
```bash
# Migrate database:
heroku run node migrate-db-sqlite.js
```

---

## **💰 Pricing**

| Plan | Cost | Includes |
|------|------|----------|
| **Eco** | $5/month | Shared resources |
| **Standard** | $7/month | Dedicated dyno |
| **Professional** | $25/month | More power |
| **PostgreSQL Add-on** | $9/month | Database |

**Minimum cost:** $5/month (Eco Dyno)

---

## **🌐 Custom Domain (Optional)**

1. Buy domain from Namecheap, GoDaddy, etc.
2. Add to Heroku:
```bash
heroku domains:add www.your-domain.com
```

3. Update DNS:
   - Go to domain registrar
   - Add CNAME: www.your-domain.com → smart-courier-system.herokuapp.com

4. Wait 24-48 hours for DNS to propagate

---

## **📱 Full URL**

```
https://smart-courier-system.herokuapp.com
```

---

## **🚀 Complete Command Sequence**

```bash
# 1. Install Heroku CLI (first time only)
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# 2. Create Procfile
echo "web: node server.js" > Procfile
git add Procfile
git commit -m "Add Procfile for Heroku"
git push origin main

# 3. Login
heroku login

# 4. Create app
heroku create smart-courier-system

# 5. Deploy
git push heroku main

# 6. Open
heroku open

# 7. View logs
heroku logs --tail
```

---

## **✅ Deployment Checklist**

- [ ] Heroku CLI installed
- [ ] Procfile created and committed
- [ ] Logged in to Heroku
- [ ] App created
- [ ] Code pushed to Heroku
- [ ] App is running (check logs)
- [ ] Website loads
- [ ] Test order creation
- [ ] Test tracking
- [ ] Share URL with users

---

## **🎯 Heroku vs Other Platforms**

| Platform | Free | Cost | Best For |
|----------|------|------|----------|
| **Replit** | ✅ | Free | Learning |
| **Railway** | $5/mo | $5/mo | Production |
| **Render** | ✅ | Free | Quick deploy |
| **Heroku** | ❌ | $5+ | Professional |
| **AWS EC2** | 1yr | Then $5+ | Enterprise |

---

## **💡 Pro Tips**

1. **Enable automatic deployments from GitHub**
   ```bash
   # In Heroku Dashboard → Deploy tab
   # Connect GitHub repo
   # Enable automatic deploys
   ```

2. **Monitor app health**
   ```bash
   heroku ps
   ```

3. **Scale up if needed**
   ```bash
   heroku ps:scale web=2
   ```

4. **Use staging app for testing**
   ```bash
   heroku create smart-courier-staging
   ```

---

## **🎉 YOU'RE LIVE ON HEROKU!**

Your Smart Courier System is now on:
```
https://smart-courier-system.herokuapp.com
```

**Share this URL with your users!**

---

## **Next Steps**

1. ✅ Test all features
2. 🌐 Add custom domain
3. 📊 Monitor metrics
4. 💾 Add PostgreSQL (optional)
5. 🚀 Scale as needed

---

**Questions?** Check: https://devcenter.heroku.com/
