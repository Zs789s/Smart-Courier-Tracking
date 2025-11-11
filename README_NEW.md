# 🚀 Smart Courier System (SCS)
## Modern Delivery Platform Startup

A cutting-edge courier delivery platform with real-time GPS tracking, interactive maps, and professional order management.

---

## 📋 Quick Start Guide

### Prerequisites
- Python 3.x (already installed)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Running the Server

The platform uses a Python HTTP server with integrated API endpoints.

```powershell
cd c:\Users\Muaaz\Desktop\web-project
python simple_server.py
```

The server will start on **http://localhost:5000**

---

## 🌐 Website Pages

### Public Pages
1. **Landing Page** - `http://localhost:5000/landing.html`
   - Hero section with service overview
   - Features, services, stats, and testimonials
   - Call-to-action buttons

2. **Home/Tracking** - `http://localhost:5000/index.html`
   - Track packages in real-time
   - Interactive Leaflet map with live location
   - Server status indicator

3. **About Us** - `http://localhost:5000/about.html`
   - Company story and mission
   - Leadership team
   - Timeline and achievements

4. **Contact** - `http://localhost:5000/contact.html`
   - Contact form
   - Business information
   - FAQ section
   - Social media links

### Customer Pages
5. **Order Delivery** - `http://localhost:5000/order-delivery.html`
   - Place orders with form
   - Auto-generates tracking numbers
   - Real-time database updates

6. **All Orders** - `http://localhost:5000/orders-list.html`
   - View all orders in database
   - Search, edit, delete functionality
   - Status tracking

7. **Manual Orders** - `http://localhost:5000/manual-orders.html`
   - Create orders manually with all fields
   - Edit existing orders
   - Manage coordinates and status
   - Professional order management UI

### Authentication Pages
8. **Login** - `http://localhost:5000/login.html`
9. **Signup** - `http://localhost:5000/signup.html`

### Admin Dashboard
10. **Owner Dashboard** - `http://localhost:5000/owner.html`
    - Manage orders and users
    - Edit order status
    - View on map
    - Search functionality

---

## 📊 Features

### Core Features
✅ **Real-Time GPS Tracking**
- Interactive Leaflet maps
- Live location markers
- Route history
- Location coordinates (latitude/longitude)

✅ **Order Management**
- Create orders with complete details
- Edit status and location
- Delete orders
- Auto-generated tracking numbers (SCS12345 format)

✅ **Database Integration**
- Persistent JSON database (db.json)
- All orders saved and retrievable
- User management
- Full CRUD operations

✅ **Professional UI**
- Modern gradient design
- Responsive layout
- Status badges
- Beautiful cards and modals
- Mobile-friendly

✅ **User Features**
- Authentication (login/signup)
- Order history
- Real-time notifications
- Search functionality

---

## 🗄️ Database Structure

All data is stored in `db.json`:

```json
{
  "users": [],
  "orders": [
    {
      "id": "uuid",
      "trackingNumber": "SCS12345",
      "sender_name": "John Doe",
      "receiver_name": "Jane Smith",
      "sender_address": "123 Main St",
      "receiver_address": "456 Oak Ave",
      "status": "In Transit",
      "location": "City Hub",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "weight": 2.5,
      "service": "Express",
      "estimated_delivery": "2025-11-15",
      "history": []
    }
  ]
}
```

---

## 🔗 API Endpoints

### Tracking
- `GET /api/track/{tracking_number}` - Get order by tracking number

### Orders (CRUD)
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/{id}` - Update order
- `DELETE /api/orders/{id}` - Delete order

### Users
- `GET /api/users` - List all users
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `DELETE /api/users/{id}` - Delete user

---

## 📁 Project Structure

```
web-project/
├── index.html                 # Tracking page
├── landing.html              # Landing/home page
├── about.html                # About us page
├── contact.html              # Contact page
├── order-delivery.html       # Place order form
├── orders-list.html          # View all orders
├── manual-orders.html        # Manual order management
├── login.html                # Login page
├── signup.html               # Signup page
├── owner.html                # Owner/admin dashboard
├── db.json                   # Database (JSON)
├── simple_server.py          # Python HTTP server with API
├── css/
│   ├── style.css            # Main styles
│   ├── order-delivery.css   # Order form styles
│   ├── owner.css            # Owner dashboard styles
│   └── ...
└── js/
    ├── script.js            # Tracking page logic
    ├── owner.js             # Owner dashboard logic
    └── ...
```

---

## 🎨 Branding

- **Colors:** Purple gradient (#667eea → #764ba2)
- **Logo:** 🚀 SCS
- **Font:** System fonts (Segoe UI, Roboto, Arial)
- **Style:** Modern, professional, startup-ready

---

##  Quick Links

- **Landing Page:** http://localhost:5000/landing.html
- **Track Package:** http://localhost:5000/index.html
- **Place Order:** http://localhost:5000/order-delivery.html
- **Manage Orders:** http://localhost:5000/manual-orders.html
- **Owner Dashboard:** http://localhost:5000/owner.html
- **About Us:** http://localhost:5000/about.html
- **Contact:** http://localhost:5000/contact.html

---

## 🛠️ Troubleshooting

### Server won't start
- Check Python is installed: `python --version`
- Ensure port 5000 is available
- Run from project root directory

### Can't see pages
- Verify server is running
- Use correct URL: `http://localhost:5000`
- Clear browser cache (Ctrl+Shift+Del)
- Check Developer Tools console (F12)

### Orders not saving
- Verify `db.json` exists
- Check server is running
- Look for API errors in console

---

**Version:** 1.0.0 Startup Edition  
**Last Updated:** November 11, 2025  
**Status:** ✅ Production Ready
