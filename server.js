const express = require('express');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Client } = require('pg');
const { nanoid } = require('nanoid');

const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || 'dev-secret-key';

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend (placed before API routes)
app.use(express.static(path.join(__dirname)));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Middleware to protect routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // No token

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token
    req.user = user;
    next();
  });
}

// Database adapter selection: prefer Postgres when DATABASE_URL is set and looks like postgres,
// otherwise fall back to SQLite adapter (local data.sqlite).
const DATABASE_URL = process.env.DATABASE_URL || '';
let db;
if (DATABASE_URL && DATABASE_URL.startsWith('postgres')) {
  // PostgreSQL Client Setup
  const client = new Client({ connectionString: DATABASE_URL });
  client.connect()
    .then(() => console.log('Connected to PostgreSQL.'))
    .catch(err => {
      console.error('Failed to connect to PostgreSQL:', err);
      process.exit(1);
    });

  // Postgres-backed implementations
  readDB = async function () {
    try {
      const usersRes = await client.query('SELECT id, username, email, password_hash FROM users ORDER BY id;');
      const ordersRes = await client.query('SELECT * FROM orders ORDER BY id;');

      const users = usersRes.rows.map(u => ({ id: u.id, username: u.username, email: u.email, password_hash: u.password_hash }));
      const orders = ordersRes.rows.map(r => ({
        id: r.id,
        tracking_number: r.tracking_number,
        trackingNumber: r.trackingnumber || r.tracking_number,
        sender_name: r.sender_name,
        sender_phone: r.sender_phone,
        sender_address: r.sender_address,
        sender_latitude: r.sender_latitude,
        sender_longitude: r.sender_longitude,
        receiver_name: r.receiver_name,
        receiver_phone: r.receiver_phone,
        receiver_address: r.receiver_address,
        receiver_latitude: r.receiver_latitude,
        receiver_longitude: r.receiver_longitude,
        parcel_description: r.parcel_description,
        value: r.value,
        special_instructions: r.special_instructions,
        carrier: r.carrier,
        service: r.service,
        weight: r.weight,
        status: r.status,
        location: r.location,
        latitude: r.latitude,
        longitude: r.longitude,
        estimated_delivery: r.estimated_delivery,
        history: Array.isArray(r.history) ? r.history : (r.history ? JSON.parse(r.history) : []),
        user_id: r.user_id
      }));

      return { users, orders };
    } catch (err) {
      console.error('readDB error:', err);
      return { users: [], orders: [] };
    }
  };

  writeDB = async function (data) {
    const orders = (data && data.orders) ? data.orders : [];
    const clientTx = client;
    try {
      await clientTx.query('BEGIN');
      await clientTx.query('DELETE FROM orders;');

      const insertText = `INSERT INTO orders (
        id, tracking_number, trackingNumber, sender_name, sender_phone, sender_address, sender_latitude, sender_longitude,
        receiver_name, receiver_phone, receiver_address, receiver_latitude, receiver_longitude,
        parcel_description, value, special_instructions, carrier, service, weight, status, location,
        latitude, longitude, estimated_delivery, history, user_id
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25
      );`;

      for (const o of orders) {
        const historyValue = o.history ? JSON.stringify(o.history) : JSON.stringify([]);
        const params = [
          o.id || null,
          o.tracking_number || o.trackingNumber || null,
          o.trackingNumber || o.tracking_number || null,
          o.sender_name || null,
          o.sender_phone || null,
          o.sender_address || null,
          o.sender_latitude || null,
          o.sender_longitude || null,
          o.receiver_name || null,
          o.receiver_phone || null,
          o.receiver_address || null,
          o.receiver_latitude || null,
          o.receiver_longitude || null,
          o.parcel_description || null,
          o.value || null,
          o.special_instructions || null,
          o.carrier || null,
          o.service || null,
          o.weight || 0,
          o.status || 'Pending',
          o.location || null,
          o.latitude || 0,
          o.longitude || 0,
          o.estimated_delivery || null,
          historyValue,
          o.user_id || null
        ];
        await clientTx.query(insertText, params);
      }

      await clientTx.query('COMMIT');
      return true;
    } catch (err) {
      await clientTx.query('ROLLBACK');
      console.error('writeDB error:', err);
      throw err;
    }
  };

  // PostgreSQL database adapter object with all methods
  db = {
    getOrders: async () => {
      const result = await client.query('SELECT * FROM orders ORDER BY id;');
      return result.rows.map(r => ({
        id: r.id,
        tracking_number: r.tracking_number,
        trackingNumber: r.tracking_number,
        sender_name: r.sender_name,
        sender_phone: r.sender_phone,
        sender_address: r.sender_address,
        sender_latitude: r.sender_latitude,
        sender_longitude: r.sender_longitude,
        receiver_name: r.receiver_name,
        receiver_phone: r.receiver_phone,
        receiver_address: r.receiver_address,
        receiver_latitude: r.receiver_latitude,
        receiver_longitude: r.receiver_longitude,
        parcel_description: r.parcel_description,
        value: r.value,
        special_instructions: r.special_instructions,
        carrier: r.carrier,
        service: r.service,
        weight: r.weight,
        status: r.status,
        location: r.location,
        latitude: r.latitude,
        longitude: r.longitude,
        estimated_delivery: r.estimated_delivery,
        history: Array.isArray(r.history) ? r.history : (r.history ? JSON.parse(r.history) : []),
        user_id: r.user_id
      }));
    },
    getOrderByTrackingNumber: async (tn) => {
      const result = await client.query('SELECT * FROM orders WHERE tracking_number = $1;', [tn]);
      return result.rows[0] || null;
    },
    createOrder: async (orderData) => {
      const history = JSON.stringify(orderData.history || [{ status: 'Order Placed', location: orderData.location || 'Customer Request', date: new Date().toISOString().slice(0,10) }]);
      const result = await client.query(
        'INSERT INTO orders (tracking_number, trackingNumber, sender_name, sender_phone, sender_address, receiver_name, receiver_phone, receiver_address, parcel_description, value, special_instructions, carrier, service, weight, status, location, latitude, longitude, estimated_delivery, history, user_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21) RETURNING *;',
        [orderData.tracking_number, orderData.trackingNumber, orderData.sender_name, orderData.sender_phone, orderData.sender_address, orderData.receiver_name, orderData.receiver_phone, orderData.receiver_address, orderData.parcel_description, orderData.value, orderData.special_instructions, orderData.carrier, orderData.service, orderData.weight, orderData.status || 'Pending', orderData.location, orderData.latitude, orderData.longitude, orderData.estimated_delivery, history, orderData.user_id]
      );
      return result.rows[0] || null;
    },
    updateOrder: async (id, data) => {
      const setFields = [];
      const values = [];
      let paramCount = 1;
      const updateableFields = ['status', 'location', 'latitude', 'longitude', 'estimated_delivery', 'carrier', 'service', 'weight', 'history'];
      for (const field of updateableFields) {
        if (data[field] !== undefined) {
          setFields.push(`${field} = $${paramCount}`);
          values.push(field === 'history' ? JSON.stringify(data[field]) : data[field]);
          paramCount++;
        }
      }
      if (setFields.length === 0) {
        const result = await client.query('SELECT * FROM orders WHERE id = $1;', [id]);
        return result.rows[0] || null;
      }
      values.push(id);
      const result = await client.query(`UPDATE orders SET ${setFields.join(', ')} WHERE id = $${paramCount} RETURNING *;`, values);
      return result.rows[0] || null;
    },
    deleteOrder: async (id) => {
      const result = await client.query('DELETE FROM orders WHERE id = $1;', [id]);
      return result.rowCount > 0;
    },
    getUsers: async () => {
      const result = await client.query('SELECT id, username, email FROM users ORDER BY id;');
      return result.rows;
    },
    getUserById: async (id) => {
      const result = await client.query('SELECT * FROM users WHERE id = $1;', [id]);
      return result.rows[0] || null;
    },
    getUserByUsername: async (username) => {
      const result = await client.query('SELECT * FROM users WHERE username = $1;', [username]);
      return result.rows[0] || null;
    },
    getUserByEmail: async (email) => {
      const result = await client.query('SELECT * FROM users WHERE email = $1;', [email]);
      return result.rows[0] || null;
    },
    createUser: async (userData) => {
      const password_hash = await bcrypt.hash(userData.password, 10);
      const result = await client.query(
        'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *;',
        [userData.username, userData.email, password_hash]
      );
      return result.rows[0] || null;
    },
    deleteUser: async (id) => {
      const result = await client.query('DELETE FROM users WHERE id = $1;', [id]);
      return result.rowCount > 0;
    },
    getOrdersByUserId: async (userId) => {
      const result = await client.query('SELECT * FROM orders WHERE user_id = $1;', [userId]);
      return result.rows.map(r => ({
        id: r.id,
        tracking_number: r.tracking_number,
        trackingNumber: r.tracking_number,
        sender_name: r.sender_name,
        sender_phone: r.sender_phone,
        sender_address: r.sender_address,
        receiver_name: r.receiver_name,
        receiver_phone: r.receiver_phone,
        receiver_address: r.receiver_address,
        parcel_description: r.parcel_description,
        value: r.value,
        special_instructions: r.special_instructions,
        carrier: r.carrier,
        service: r.service,
        weight: r.weight,
        status: r.status,
        location: r.location,
        latitude: r.latitude,
        longitude: r.longitude,
        estimated_delivery: r.estimated_delivery,
        history: Array.isArray(r.history) ? r.history : (r.history ? JSON.parse(r.history) : []),
        user_id: r.user_id
      }));
    }
  };
} else {
  const sqliteAdapter = require('./db-sqlite');
  db = sqliteAdapter;
  console.log('Using SQLite adapter (data.sqlite).');
}

// NOTE: static file serving moved below route protections so we can protect specific files (e.g., owner.html)

// Helpers
function formatOrder(o) {
  return {
    id: o.id,
    tracking_number: o.tracking_number,
    trackingNumber: o.tracking_number,
    carrier: o.carrier,
    service: o.service,
    weight: o.weight,
    status: o.status,
    location: o.location,
    latitude: o.latitude,
    longitude: o.longitude,
    sender_latitude: o.sender_latitude,
    sender_longitude: o.sender_longitude,
    receiver_latitude: o.receiver_latitude,
    receiver_longitude: o.receiver_longitude,
    estimated_delivery: o.estimated_delivery,
    history: o.history || []
  };
}

// Protect owner.html and related API routes
app.get('/owner.html', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'owner.html'));
});
app.get('/api/orders', authenticateToken, async (req, res) => {
  const orders = await db.getOrders();
  return res.json({ orders: orders.map(formatOrder) });
});

// Public endpoint for tracking by tracking number
app.get('/api/track/:tracking_number', async (req, res) => {
  try {
    const tn = req.params.tracking_number;
    const orders = await db.getOrders();
    const order = orders.find(o => o.tracking_number === tn);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    return res.json(formatOrder(order));
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({ message: 'Error tracking order', error: error.message });
  }
});

// Public endpoint for searching orders by phone number (sender or receiver). Returns array of matching orders.
app.get('/api/track/phone/:phone', async (req, res) => {
  try {
    const raw = req.params.phone || '';
    const q = String(raw).replace(/\D/g, ''); // digits only
    if (!q) return res.status(400).json({ message: 'Invalid phone number' });

    const orders = await db.getOrders();
    const matches = orders.filter(o => {
      const sp = String(o.sender_phone || o.senderPhone || '').replace(/\D/g, '');
      const rp = String(o.receiver_phone || o.receiverPhone || '').replace(/\D/g, '');
      return (sp && sp.includes(q)) || (rp && rp.includes(q));
    });

    const results = matches.map(formatOrder);
    return res.json({ orders: results });
  } catch (error) {
    console.error('Error searching orders by phone:', error);
    res.status(500).json({ message: 'Error searching orders', error: error.message });
  }
});


// Protected route for user dashboard
app.get('/user-dashboard.html', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'user-dashboard.html'));
});

// Protected API endpoint for user-specific orders
app.get('/api/user-orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is available in req.user after authentication
    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in token' });
    }
    const userOrders = await db.getOrdersByUserId(userId);
    res.json({ orders: userOrders.map(formatOrder) });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Error fetching user orders', error: error.message });
  }
});

// Public endpoint for placing orders (no authentication required)
app.post('/api/orders', async (req, res) => {
  try {
    const data = req.body || {};
    const tracking_number = data.tracking_number || `SCS${nanoid(7).toUpperCase()}`;
    const orderData = {
      tracking_number,
      // include optional fields sent by clients
      trackingNumber: tracking_number,
      sender_name: data.sender_name || data.senderName || '',
      sender_address: data.sender_address || data.senderAddress || '',
      sender_phone: data.sender_phone || data.senderPhone || '',
      receiver_name: data.receiver_name || data.receiverName || '',
      receiver_address: data.receiver_address || data.receiverAddress || '',
      receiver_phone: data.receiver_phone || data.receiverPhone || '',
      parcel_description: data.parcel_description || data.parcelDescription || '',
      value: data.value || data.estimated_value || 0,
      special_instructions: data.special_instructions || data.specialInstructions || '',
      carrier: data.carrier || 'SCS Logistics',
      service: data.service || 'Standard',
      weight: data.weight || 0,
      status: data.status || 'Pending',
      location: data.location || 'Order Placed',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      estimated_delivery: data.estimated_delivery || 'To be determined',
      history: data.history || [{ status: 'Order Placed', location: data.location || 'Customer Request', date: new Date().toISOString().slice(0,10) }]
    };
    const newOrder = await db.createOrder(orderData);
    // Return the created order and both tracking_number and trackingNumber for client compatibility
    res.status(201).json({
      message: 'Order created successfully',
      tracking_number: newOrder.tracking_number,
      trackingNumber: newOrder.tracking_number,
      order: formatOrder(newOrder)
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

// Delete order endpoint (with error handling)
app.delete('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const success = await db.deleteOrder(id);
    if (!success) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Error deleting order', error: error.message });
  }
});

app.put('/api/orders/:id', authenticateToken, async (req, res) => {
  const id = Number(req.params.id);
  const updatedOrder = await db.updateOrder(id, req.body);
  if (!updatedOrder) return res.status(404).json({ message: 'Order not found' });
  res.json({ message: 'Order updated successfully', order: formatOrder(updatedOrder) });
});

// Users
app.get('/api/users', authenticateToken, async (req, res) => {
  const users = await db.getUsers();
  res.json({ users });
});

// Return current authenticated user info
app.get('/api/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user && req.user.user_id;
    if (!userId) return res.status(401).json({ message: 'Unauthenticated' });
    const user = await db.getUserById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    // return minimal safe profile
    return res.json({ id: user.id, username: user.username, email: user.email });
  } catch (err) {
    console.error('/api/me error', err);
    return res.status(500).json({ message: 'Failed to fetch user info' });
  }
});

// Return orders for the authenticated user
app.get('/api/myorders', authenticateToken, async (req, res) => {
  try {
    const orders = await db.getOrders();
    const userId = req.user && req.user.user_id;
    const myOrders = orders.filter(o => Number(o.user_id) === Number(userId));
    return res.json({ orders: myOrders.map(formatOrder) });
  } catch (err) {
    console.error('myorders error', err);
    return res.status(500).json({ message: 'Failed to fetch user orders' });
  }
});

app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  const id = Number(req.params.id);
  const success = await db.deleteUser(id);
  if (!success) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User deleted successfully' });
});

// Owner registration endpoint
app.post('/api/owner-register', async (req, res) => {
  try {
    const { username, email, password } = req.body || {};
    if (!username || !email || !password) return res.status(400).json({ message: 'Missing required fields' });
    
    const existingUserByUsername = await db.getUserByUsername(username);
    if (existingUserByUsername) return res.status(400).json({ message: 'Username already exists' });

    const existingUserByEmail = await db.getUserByEmail(email);
    if (existingUserByEmail) return res.status(400).json({ message: 'Email already exists' });
    
    // Create the owner account
    const newUser = await db.createUser({ username, email, password });
    res.status(201).json({ message: 'Owner account created successfully', id: newUser.id, username: newUser.username });
  } catch (error) {
    console.error('Error during owner registration:', error);
    res.status(500).json({ message: 'Error creating owner account', error: error.message });
  }
});

// Owner-only login endpoint
app.post('/api/owner-login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ message: 'Missing username or password' });
  const user = await db.getUserByUsername(username);
  if (!user) return res.status(401).json({ message: 'Invalid username or password' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: 'Invalid username or password' });
  // For now, issue token to any authenticated user (you can add role checks later)
  const token = jwt.sign({ user_id: user.id }, SECRET, { expiresIn: '1d' });
  res.json({ message: 'Owner login successful', token, username: user.username, id: user.id });
});

// Fallback to serve index.html for other routes (SPA behavior)
app.get('*', (req, res) => {
  console.log('Fallback route:', req.method, req.path);
  res.sendFile(path.join(__dirname, 'index.html'), (err) => {
    if (err) console.error('sendFile error:', err);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
