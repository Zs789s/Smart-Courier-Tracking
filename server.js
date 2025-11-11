const express = require('express');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const { nanoid } = require('nanoid');

const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || 'dev-secret-key';

const app = express();
app.use(cors());
app.use(express.json());

// Database (lowdb)
const file = path.join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

async function initDB() {
  await db.read();
  db.data = db.data || { users: [], orders: [] };
  // Ensure unique numeric id for orders
  if (!Array.isArray(db.data.orders)) db.data.orders = [];
  if (!Array.isArray(db.data.users)) db.data.users = [];
  await db.write();
}

initDB();

// Serve static frontend
app.use(express.static(path.join(__dirname)));

// Helpers
function formatOrder(o) {
  return {
    id: o.id,
    tracking_number: o.tracking_number,
    carrier: o.carrier,
    service: o.service,
    weight: o.weight,
    status: o.status,
    location: o.location,
    latitude: o.latitude,
    longitude: o.longitude,
    estimated_delivery: o.estimated_delivery,
    history: o.history || []
  };
}

// Routes
app.get('/api/track/:tracking_number', async (req, res) => {
  await db.read();
  const tn = req.params.tracking_number;
  const order = db.data.orders.find(o => o.tracking_number === tn);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  return res.json(formatOrder(order));
});

app.get('/api/orders', async (req, res) => {
  await db.read();
  return res.json({ orders: db.data.orders.map(formatOrder) });
});

app.post('/api/orders', async (req, res) => {
  await db.read();
  const data = req.body || {};
  const nextId = db.data.orders.length ? Math.max(...db.data.orders.map(o => o.id)) + 1 : 1;
  const tracking_number = data.tracking_number || ('SCS' + (10000 + nextId));
  const order = {
    id: nextId,
    tracking_number,
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
  db.data.orders.push(order);
  await db.write();
  res.status(201).json({ message: 'Order created successfully', tracking_number: order.tracking_number });
});

app.delete('/api/orders/:id', async (req, res) => {
  await db.read();
  const id = Number(req.params.id);
  const idx = db.data.orders.findIndex(o => o.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Order not found' });
  db.data.orders.splice(idx, 1);
  await db.write();
  res.json({ message: 'Order deleted successfully' });
});

app.put('/api/orders/:id', async (req, res) => {
  await db.read();
  const id = Number(req.params.id);
  const order = db.data.orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  const fields = ['status','location','latitude','longitude','estimated_delivery','carrier','service','weight','history'];
  fields.forEach(f => {
    if (req.body[f] !== undefined) order[f] = req.body[f];
  });
  await db.write();
  res.json({ message: 'Order updated successfully', order: formatOrder(order) });
});

// Users
app.get('/api/users', async (req, res) => {
  await db.read();
  const users = db.data.users.map(u => ({ id: u.id, username: u.username, email: u.email }));
  res.json({ users });
});

app.delete('/api/users/:id', async (req, res) => {
  await db.read();
  const id = Number(req.params.id);
  const idx = db.data.users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });
  db.data.users.splice(idx,1);
  await db.write();
  res.json({ message: 'User deleted successfully' });
});

app.post('/api/register', async (req, res) => {
  await db.read();
  const { username, email, password } = req.body || {};
  if (!username || !email || !password) return res.status(400).json({ message: 'Missing required fields' });
  if (db.data.users.find(u => u.username === username)) return res.status(400).json({ message: 'Username already exists' });
  if (db.data.users.find(u => u.email === email)) return res.status(400).json({ message: 'Email already exists' });
  const id = db.data.users.length ? Math.max(...db.data.users.map(u => u.id)) + 1 : 1;
  const password_hash = await bcrypt.hash(password, 10);
  db.data.users.push({ id, username, email, password_hash });
  await db.write();
  res.status(201).json({ message: 'User created successfully' });
});

app.post('/api/login', async (req, res) => {
  await db.read();
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ message: 'Missing username or password' });
  const user = db.data.users.find(u => u.username === username);
  if (!user) return res.status(401).json({ message: 'Invalid username or password' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: 'Invalid username or password' });
  const token = jwt.sign({ user_id: user.id }, SECRET, { expiresIn: '1d' });
  res.json({ message: 'Login successful', token, username: user.username });
});

// Fallback to serve index.html for other routes (SPA behavior)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
