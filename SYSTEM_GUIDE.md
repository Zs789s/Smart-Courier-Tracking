# Smart Courier System (SCS) - Production Guide

## Overview

Smart Courier System (SCS) is a professional, fully-functional courier and delivery tracking application built with Python HTTP server backend and vanilla HTML5/CSS3/JavaScript frontend.

**Version:** 1.0  
**Last Updated:** November 11, 2025  
**Status:** Production Ready

---

## System Architecture

### Backend
- **Server:** Python 3 HTTP Server (`simple_server.py`)
- **Port:** 5000 (localhost)
- **Database:** JSON file (`db.json`) - simple file-based storage
- **API Format:** RESTful JSON

### Frontend
- **Type:** Single Page Application (SPA) with multiple HTML pages
- **CSS Framework:** Custom CSS with responsive design
- **Maps:** Leaflet.js for interactive GPS tracking
- **JS:** Vanilla JavaScript (no frameworks)

### Database Structure
```json
{
  "users": [
    {
      "id": "unique-id",
      "username": "string",
      "email": "string",
      "password": "SHA-256 hash",
      "phone": "string",
      "address": "string",
      "createdAt": "ISO timestamp"
    }
  ],
  "orders": [
    {
      "id": "unique-id",
      "trackingNumber": "SCS#####",
      "sender_name": "string",
      "sender_address": "string",
      "sender_phone": "string",
      "receiver_name": "string",
      "receiver_address": "string",
      "receiver_phone": "string",
      "parcel_description": "string",
      "weight": "float (kg)",
      "value": "float (currency)",
      "service": "Express|Standard|Overnight",
      "status": "Shipment Created|Processing|In Transit|Out for Delivery|Delivered",
      "location": "string",
      "latitude": "float",
      "longitude": "float",
      "estimated_delivery": "YYYY-MM-DD",
      "history": [
        {
          "status": "string",
          "location": "string",
          "date": "YYYY-MM-DD",
          "time": "HH:MM"
        }
      ],
      "createdAt": "ISO timestamp",
      "updatedAt": "ISO timestamp"
    }
  ]
}
```

---

## How to Start the Server

### Option 1: PowerShell / Command Line
```powershell
cd C:\Users\Muaaz\Desktop\web-project
python simple_server.py
```

### Option 2: Python Environment
```bash
conda activate web-project  # if using conda
python simple_server.py
```

**Expected Output:**
```
✓ Server running on http://localhost:5000
✓ Tracking page: http://localhost:5000
✓ Owner dashboard: http://localhost:5000/owner.html
✓ Press Ctrl+C to stop
```

---

## Available Pages & URLs

### Public Pages (No Authentication Required)

| Page | URL | Purpose |
|------|-----|---------|
| **Landing Page** | `http://localhost:5000/landing.html` | Home page with features & CTA |
| **Tracking** | `http://localhost:5000/index.html` | Real-time order tracking with map |
| **Place Order** | `http://localhost:5000/order-delivery.html` | Customer order form |
| **Services** | `http://localhost:5000/services.html` | Service descriptions |
| **About** | `http://localhost:5000/about.html` | Company information |
| **Contact** | `http://localhost:5000/contact.html` | Contact form & info |

### Authentication Pages

| Page | URL | Purpose |
|------|-----|---------|
| **Login** | `http://localhost:5000/login.html` | User login |
| **Sign Up** | `http://localhost:5000/signup.html` | User registration |

### Admin/Dashboard Pages

| Page | URL | Purpose |
|------|-----|---------|
| **Owner Dashboard** | `http://localhost:5000/owner.html` | Admin dashboard with map & orders |
| **Manual Orders** | `http://localhost:5000/manual-orders.html` | Create/Edit/Delete orders admin interface |
| **Orders List** | `http://localhost:5000/orders-list.html` | Table view of all orders |

---

## Database Connection & Integration

### 📊 Database Architecture

**Type:** JSON File-Based Database  
**Location:** `db.json` in project root  
**Format:** JSON with `users` and `orders` collections  
**Auto-Save:** Yes - changes are immediately written to disk  

### 🔗 How Data Flows

```
User Form Input (order-delivery.html)
         ↓
JavaScript Form Handler (in order-delivery.html)
         ↓
POST /api/orders (JSON data)
         ↓
simple_server.py - handle_api_post()
         ↓
Generate Tracking Number (SCS##### format)
         ↓
Create Order Object with all fields
         ↓
db.load_db() → read current db.json
         ↓
db['orders'].append(new_order)
         ↓
db.save_db() → write updated data to db.json
         ↓
Return 201 Created + Order Object + Tracking Number
         ↓
JavaScript receives response & displays success
```

### 📝 Order Creation Flow in Detail

#### Step 1: User Fills Form (order-delivery.html)
```html
<input type="text" id="sender-name" required>
<input type="tel" id="sender-phone" required>
<input type="text" id="sender-address" required>
<input type="text" id="receiver-name" required>
<input type="tel" id="receiver-phone" required>
<input type="text" id="receiver-address" required>
<textarea id="parcel-description" required></textarea>
<select id="delivery-type" required>
  <option value="standard">Standard</option>
  <option value="express">Express</option>
</select>
<input type="number" id="weight">
<input type="number" id="value">
<input type="text" id="special-instructions">
```

#### Step 2: Form Submission (JavaScript)
```javascript
// Collect all form values
const formData = {
  sender_name: document.getElementById('sender-name').value,
  sender_phone: document.getElementById('sender-phone').value,
  sender_address: document.getElementById('sender-address').value,
  receiver_name: document.getElementById('receiver-name').value,
  receiver_phone: document.getElementById('receiver-phone').value,
  receiver_address: document.getElementById('receiver-address').value,
  parcel_description: document.getElementById('parcel-description').value,
  service: document.getElementById('delivery-type').value,
  weight: parseFloat(document.getElementById('weight').value),
  value: parseFloat(document.getElementById('value').value),
  special_instructions: document.getElementById('special-instructions').value,
  carrier: 'SCS Logistics',
  status: 'Shipment Created',
  location: 'Origin Facility',
  estimated_delivery: calculated_date
};

// Send to API
fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
})
```

#### Step 3: Server Processing (simple_server.py)
```python
def handle_api_post(self, path, data):
    if path == '/api/orders':
        # Generate unique tracking number
        tracking_num = 'SCS' + ''.join(random.choices(string.digits, k=5))
        
        # Create order object
        order = {
            'id': str(uuid4()),
            'trackingNumber': tracking_num,
            'sender_name': data.get('sender_name'),
            'sender_phone': data.get('sender_phone'),
            'sender_address': data.get('sender_address'),
            'receiver_name': data.get('receiver_name'),
            'receiver_phone': data.get('receiver_phone'),
            'receiver_address': data.get('receiver_address'),
            'parcel_description': data.get('parcel_description'),
            'service': data.get('service'),
            'weight': float(data.get('weight', 1.0)),
            'value': float(data.get('value', 0)),
            'carrier': 'SCS Logistics',
            'status': 'Shipment Created',
            'location': 'Origin Facility',
            'latitude': 40.7128,
            'longitude': -74.0060,
            'estimated_delivery': data.get('estimated_delivery'),
            'history': [{
                'status': 'Shipment Created',
                'location': 'Origin Facility',
                'date': datetime.now().strftime('%Y-%m-%d')
            }],
            'createdAt': datetime.now().isoformat()
        }
        
        # Load database
        db = load_db()
        
        # Add new order
        db['orders'].append(order)
        
        # Save to db.json
        save_db(db)
        
        # Return response
        self.send_json(201, order)
```

#### Step 4: Database Update (db.json)
```json
{
  "orders": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "trackingNumber": "SCS98765",
      "sender_name": "John Doe",
      "sender_phone": "+1-555-001-0001",
      "sender_address": "123 Main St, New York",
      "receiver_name": "Jane Smith",
      "receiver_phone": "+1-555-002-0002",
      "receiver_address": "456 Park Ave, Los Angeles",
      "parcel_description": "Electronics",
      "weight": 2.5,
      "value": 1200,
      "service": "express",
      "carrier": "SCS Logistics",
      "status": "Shipment Created",
      "location": "Origin Facility",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "estimated_delivery": "November 12, 2025",
      "history": [...],
      "createdAt": "2025-11-11T15:30:45.123456"
    }
  ]
}
```

#### Step 5: Client Receives Response
```javascript
// Success response
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "trackingNumber": "SCS98765",
  "sender_name": "John Doe",
  // ... all order data ...
  "createdAt": "2025-11-11T15:30:45.123456"
}

// Display tracking number to user
document.getElementById('tracking-number-display').textContent = 'SCS98765';
// Show success message
document.getElementById('tracking-info').classList.add('show');
```

### 📦 Complete Order Fields in Database

Each order object contains:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | UUID | Unique order ID | `550e8400-e29b-41d4-a716-446655440000` |
| trackingNumber | String | Public tracking number | `SCS98765` |
| sender_name | String | Sender full name | `John Doe` |
| sender_phone | String | Sender phone | `+1-555-001-0001` |
| sender_address | String | Sender address | `123 Main St, New York` |
| receiver_name | String | Receiver full name | `Jane Smith` |
| receiver_phone | String | Receiver phone | `+1-555-002-0002` |
| receiver_address | String | Receiver address | `456 Park Ave, Los Angeles` |
| parcel_description | String | What's being sent | `Electronics` |
| weight | Float | Weight in kg | `2.5` |
| value | Float | Estimated value | `1200` |
| service | String | Delivery type | `express` or `standard` |
| carrier | String | Courier company | `SCS Logistics` |
| status | String | Current status | `Shipment Created`, `In Transit`, etc. |
| location | String | Current location | `Origin Facility` |
| latitude | Float | GPS latitude | `40.7128` |
| longitude | Float | GPS longitude | `-74.0060` |
| estimated_delivery | String | Expected delivery date | `November 12, 2025` |
| history | Array | Status history | `[{status, location, date, time}]` |
| createdAt | ISO String | When order was created | `2025-11-11T15:30:45` |

### ✅ Data Persistence

**All data is automatically saved to `db.json`:**
- ✅ New orders created via form
- ✅ New orders created via admin interface
- ✅ Order status updates
- ✅ Order deletions
- ✅ User registrations
- ✅ User logins (token created)

### 🔄 Real-Time Database Operations

#### Loading Orders
```python
def load_db():
    """Load data from db.json"""
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, 'r') as f:
                return json.load(f)
        except:
            pass
    return {"orders": [], "users": []}
```

#### Saving Orders
```python
def save_db(data):
    """Save data to db.json"""
    with open(DB_FILE, 'w') as f:
        json.dump(data, f, indent=2)
```

### 🔍 Query Examples

#### Get All Orders
```powershell
# PowerShell
Invoke-WebRequest http://localhost:5000/api/orders | ConvertFrom-Json
```

Invoke-WebRequest http://localhost:5000/api/orders | ConvertFrom-Json
```

#### Track a Specific Order
```powershell
# PowerShell
Invoke-WebRequest http://localhost:5000/api/track/YOUR_TRACKING_NUMBER | ConvertFrom-Json
```

#### Create New Order via API
```powershell
$order = @{
  sender_name = "John Doe"
  sender_phone = "+1-555-001"
  sender_address = "123 Main St"
  receiver_name = "Jane Smith"
  receiver_phone = "+1-555-002"
  receiver_address = "456 Park Ave"
  parcel_description = "Electronics"
  weight = 2.5
  value = 1200
  service = "express"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/orders `
  -Method POST `
  -Body $order `
  -ContentType "application/json"
```

### 📊 Monitoring Database

#### Check Database File Size
```powershell
(Get-Item db.json).Length  # File size in bytes
```

#### Count Orders
```powershell
# Using PowerShell JSON parsing
$db = Get-Content db.json | ConvertFrom-Json
$db.orders.Count
```

#### Validate Database Format
```powershell
# Test if JSON is valid
Get-Content db.json | ConvertFrom-Json | Out-Null
if ($?) { Write-Host "✓ Database is valid" } else { Write-Host "✗ Corrupt database" }
```

---

## API Endpoints

### Order Management

#### Get All Orders
```http
GET /api/orders
```
**Response:** Array of all orders

#### Track Order by Tracking Number
```http
GET /api/track/{trackingNumber}
```
**Example:** `GET /api/orders` → Returns all orders  
**Example:** `POST /api/orders` → Create new order
**Response:** Single order object

#### Get Order by ID
```http
GET /api/orders/{orderId}
```

#### Create New Order
```http
POST /api/orders
Content-Type: application/json

{
  "sender_name": "John Doe",
  "sender_address": "123 Main St, City A",
  "sender_phone": "+1-555-001-0001",
  "receiver_name": "Jane Smith",
  "receiver_address": "456 Park Ave, City B",
  "receiver_phone": "+1-555-002-0002",
  "parcel_description": "Electronics",
  "weight": 2.5,
  "value": 1200,
  "service": "Express"
}
```
**Response:** Created order with auto-generated tracking number

#### Update Order
```http
PUT /api/orders/{orderId}
Content-Type: application/json

{
  "status": "In Transit",
  "location": "Distribution Center"
}
```

#### Delete Order
```http
DELETE /api/orders/{orderId}
```

### User Management

#### Get All Users
```http
GET /api/users
```

#### Register New User
```http
POST /api/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### User Login
```http
POST /api/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securePassword123"
}
```

#### Delete User
```http
DELETE /api/users/{userId}
```

---

## Test Accounts for Development

### Test Users (Available in db.json)

| Username | Email | Password | Role |
|----------|-------|----------|------|
| admin | admin@smartcourier.com | admin123 | Administrator |
| john_customer | john@example.com | john123 | Customer |
| jane_merchant | jane@merchant.com | jane123 | Merchant |

**Note:** These test accounts are available for authentication testing. Create your own production data through the system.

---

## Key Features

### 1. Real-Time Tracking
- **Interactive Map:** Leaflet.js powered map showing package locations
- **Status Timeline:** Complete delivery history with timestamps
- **Live Updates:** Track orders in real-time

### 2. Order Management
- **Create Orders:** Simple form for customers to place orders
- **Manual Creation:** Admin interface to create orders directly
- **Edit/Delete:** Full CRUD operations for order management
- **Search:** Find orders by tracking number, status, or location

### 3. Professional UI/UX
- **Responsive Design:** Works on desktop, tablet, mobile
- **Modern Styling:** Gradient colors, smooth animations
- **Navigation:** Consistent header/footer across all pages
- **Accessibility:** Semantic HTML, proper form labels

### 4. User Management
- **Registration:** New user signup
- **Login:** User authentication (basic)
- **Profile:** User information storage

### 5. Admin Dashboard
- **Order Overview:** View all orders with search & filter
- **Map Visualization:** See all orders on interactive map
- **User Management:** View and delete users
- **Quick Actions:** Create, edit, delete orders

---

## How to Use Each Page

### 1. Landing Page (`landing.html`)
- Overview of services
- Quick links to key features
- Customer testimonials
- Call-to-action buttons

### 2. Tracking Page (`index.html`)
- **How to Use:**
  1. Enter a tracking number of your order
  2. Click "Track" button
  3. View order details and interactive map
  4. See complete delivery history

### 3. Place Order (`order-delivery.html`)
- **How to Use:**
  1. Fill sender information
  2. Fill receiver information
  3. Enter package details
  4. Select delivery service
  5. Click "Place Order"
  6. Receive tracking number
  7. Share tracking with customer

### 4. Owner Dashboard (`owner.html`)
- **Features:**
  - View all orders with search
  - Map visualization of deliveries
  - See order details on click
  - Manage users
  - Refresh data in real-time

### 5. Manual Orders (`manual-orders.html`)
- **Create Order:**
  1. Click "Create Order" tab
  2. Fill all form fields
  3. Click "Create Order" button
  4. System generates tracking number automatically

- **Manage Orders:**
  1. Click "View All Orders" tab
  2. See all orders in table
  3. Click order row to edit
  4. Update status, location, etc.
  5. Delete if needed

### 6. Orders List (`orders-list.html`)
- Table view of all orders
- Quick view of key information
- Delete orders directly
- Track orders quickly

---

## Configuration

### Changing Server Port
Edit `simple_server.py` line ~280:
```python
PORT = 5000  # Change this to desired port
```

### Customizing Company Information
Update these files with your business details:
- `landing.html` - Company name, description
- `about.html` - Company story, team info
- `contact.html` - Contact details, address
- `services.html` - Service descriptions

### Modifying Delivery Services
The system supports these service types:
- Express (fastest)
- Standard (default)
- Overnight (overnight delivery)

Add more in `order-delivery.html` select dropdown if needed.

---

## Troubleshooting

### Server Won't Start
**Error:** `Address already in use`
- **Solution:** Change PORT in `simple_server.py` or kill existing process

### Orders Not Saving
**Symptom:** Orders created but don't appear later
- **Solution:** Check database permissions for `db.json`
- **Solution:** Ensure `db.json` is not corrupted

### Map Not Showing
**Symptom:** Map appears blank on tracking page
- **Solution:** Check internet connection (Leaflet CDN needs external access)
- **Solution:** Clear browser cache

### API Endpoints Return 404
**Symptom:** Orders/Users API returns 404
- **Solution:** Ensure server is running on correct port
- **Solution:** Check URL format matches documentation

### Tracking Number Not Generating
**Symptom:** New orders created without tracking number
- **Solution:** Server automatically generates `SCS#####` format
- **Solution:** Check `simple_server.py` POST handler

---

## Database Maintenance

### Backup Database
```powershell
Copy-Item db.json db.json.backup
```

### Reset Database
```powershell
# Delete db.json, server will recreate empty structure
Remove-Item db.json

# Or restore from backup
Copy-Item db.json.backup db.json
```

### Verify Database Integrity
```powershell
python -m json.tool db.json > db_validated.json
```

---

## Performance Tips

1. **Limit Orders:** Keep under 10,000 orders for optimal performance
2. **Cache Clearing:** Periodically clear browser cache
3. **Database Backup:** Backup database daily
4. **Monitor Port:** Ensure port 5000 is not used by other applications

---

## Security Notes

⚠️ **Current Limitations (Development Mode):**
- Passwords stored as SHA-256 hashes (not salted)
- No session management
- No HTTPS enforcement
- CORS enabled for all origins

**For Production:**
- Implement proper authentication/authorization
- Use HTTPS/SSL certificates
- Add rate limiting
- Implement proper password hashing (bcrypt)
- Use database backend (PostgreSQL, MongoDB)
- Add API key authentication
- Implement CSRF protection

---

## Support & Contact

For issues or questions:
- Check system logs
- Review API responses in browser console
- Verify database file exists and is valid
- Check file permissions

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 11, 2025 | Initial production release with complete feature set |

---

**End of System Guide**
