# Smart Courier System - Quick Start Guide

## Get Started in 30 Seconds

### Step 1: Start the Server
Open PowerShell and run:
```powershell
cd C:\Users\Muaaz\Desktop\web-project
python simple_server.py
```

You should see:
```
✓ Server running on http://localhost:5000
✓ Tracking page: http://localhost:5000
✓ Owner dashboard: http://localhost:5000/owner.html
✓ Press Ctrl+C to stop
```

### Step 2: Open in Browser
Click one of these links:

**For Customers:**
- [Landing Page](http://localhost:5000/landing.html) - Home page
- [Place Order](http://localhost:5000/order-delivery.html) - Create new delivery
- [Track Order](http://localhost:5000/index.html) - Track with code (try: **SCS12345**)

**For Admins:**
- [Owner Dashboard](http://localhost:5000/owner.html) - Manage all orders
- [Manual Orders](http://localhost:5000/manual-orders.html) - Create/edit orders

### Step 3: Test It Out

#### Create New Order
1. Go to: http://localhost:5000/order-delivery.html
2. Fill the form
3. Click "Place Order"
4. Get automatic tracking number!

#### Manage Orders (Admin)
1. Go to: http://localhost:5000/manual-orders.html
2. Create, view, edit, or delete orders
3. All changes save to database instantly

---

## What You Can Do

✅ Track packages in real-time with interactive map  
✅ Create orders and auto-generate tracking numbers  
✅ View complete delivery history with timestamps  
✅ Search orders by tracking number or status  
✅ Edit order details as needed  
✅ Delete old orders  
✅ See all deliveries on map  
✅ Manage users (admin only)  
✅ Responsive design - works on phone/tablet/desktop  

---

## Need Help?

### Server Won't Start?
- Close other programs using port 5000
- Or edit `simple_server.py` line 280 to use different port

### Orders Not Saving?
- Check that `db.json` file exists
- Make sure you have write permissions in the folder

### Map Not Showing?
- Check internet connection (needs Leaflet.js from CDN)
- Clear browser cache

### Tracking Not Working?
- Copy exact tracking number from the list above
- Or create a new order to get a tracking number

---

## File Structure

```
web-project/
├── simple_server.py          ← Run this to start server
├── db.json                   ← Database (automatically managed)
├── landing.html              ← Home page
├── index.html                ← Tracking page
├── order-delivery.html       ← Order placement form
├── owner.html                ← Admin dashboard
├── manual-orders.html        ← Order management
├── about.html                ← Company info
├── contact.html              ← Contact page
├── login.html                ← Login page
├── signup.html               ← Registration page
├── css/                      ← Stylesheets
├── js/                       ← JavaScript files
└── SYSTEM_GUIDE.md           ← Full documentation
```

---

## Common Tasks

### How to place an order?
→ Go to **order-delivery.html** → Fill form → Click "Place Order"

### How to track package?
→ Go to **index.html** → Enter tracking number → Click "Track"

### How to see all orders?
→ Go to **manual-orders.html** → Click "View All Orders" tab

### How to edit an order?
→ Go to **manual-orders.html** → Click order row → Change details → Save

### How to create test order?
→ Go to **manual-orders.html** → Click "Create Order" tab → Fill form → Submit

---

## Tips for Best Experience

1. **Mobile Testing:** Responsive design - try on phone!
2. **Multiple Tabs:** Keep tracking in one tab, order form in another
3. **Browser Console:** Press F12 to see API responses
4. **Database Reset:** Delete `db.json` to start fresh (server recreates it)
5. **Server Logs:** Watch terminal to see real-time API calls

---

## Production Deployment

When ready to go live:

1. **Security:** Add HTTPS/SSL certificate
2. **Authentication:** Enable real user sessions
3. **Database:** Move to PostgreSQL or MongoDB
4. **Hosting:** Deploy to AWS, DigitalOcean, or similar
5. **Domain:** Use real domain instead of localhost
6. **Email:** Add email notifications for orders
7. **SMS:** Add SMS tracking notifications (optional)
8. **Payments:** Integrate payment gateway (optional)

---

## Support

For full documentation, see: **SYSTEM_GUIDE.md**

Enjoy your Smart Courier System! 🚀
