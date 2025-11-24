const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, 'data.sqlite');
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

function normalizeOrder(order) {
    if (!order) return null;
    try {
        order.history = order.history ? JSON.parse(order.history) : [];
    } catch (e) {
        order.history = [];
    }
    order.trackingNumber = order.trackingNumber || order.tracking_number;
    return order;
}

// Promisify db methods
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

// --- Orders ---
async function getOrders() {
    const rows = await all('SELECT * FROM orders ORDER BY id;');
    return rows.map(normalizeOrder);
}

async function getOrderByTrackingNumber(tn) {
    const order = await get('SELECT * FROM orders WHERE tracking_number = ?', [tn]);
    return normalizeOrder(order);
}

async function getOrdersByPhone(phoneQuery) {
    // This is a simplified search. A more robust solution might use a dedicated search index.
    const orders = await all('SELECT * FROM orders WHERE sender_phone LIKE ? OR receiver_phone LIKE ?', [`%${phoneQuery}%`, `%${phoneQuery}%`]);
    return orders.map(normalizeOrder);
}

async function createOrder(orderData) {
    const sql = `INSERT INTO orders (
        tracking_number, trackingNumber, sender_name, sender_phone, sender_address,
        receiver_name, receiver_phone, receiver_address, parcel_description, value,
        special_instructions, carrier, service, weight, status, location, latitude, longitude,
        estimated_delivery, history
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const history = JSON.stringify(orderData.history || [{ status: 'Order Placed', location: orderData.location || 'Customer Request', date: new Date().toISOString().slice(0,10) }]);

    const params = [
        orderData.tracking_number, orderData.trackingNumber, orderData.sender_name, orderData.sender_phone, orderData.sender_address,
        orderData.receiver_name, orderData.receiver_phone, orderData.receiver_address, orderData.parcel_description, orderData.value,
        orderData.special_instructions, orderData.carrier, orderData.service, orderData.weight, orderData.status,
        orderData.location, orderData.latitude, orderData.longitude, orderData.estimated_delivery, history
    ];
    const result = await run(sql, params);
    const newOrder = await get('SELECT * FROM orders WHERE id = ?', [result.lastID]);
    return normalizeOrder(newOrder);
}

async function updateOrder(id, data) {
    const fields = ['status', 'location', 'latitude', 'longitude', 'estimated_delivery', 'carrier', 'service', 'weight', 'history'];
    const sets = [];
    const params = [];
    for (const field of fields) {
        if (data[field] !== undefined) {
            sets.push(`${field} = ?`);
            params.push(field === 'history' ? JSON.stringify(data[field]) : data[field]);
        }
    }
    if (sets.length === 0) {
        const order = await get('SELECT * FROM orders WHERE id = ?', [id]);
        return normalizeOrder(order);
    }

    const sql = `UPDATE orders SET ${sets.join(', ')} WHERE id = ?`;
    params.push(id);
    await run(sql, params);
    const updatedOrder = await get('SELECT * FROM orders WHERE id = ?', [id]);
    return normalizeOrder(updatedOrder);
}

async function deleteOrder(id) {
    const result = await run('DELETE FROM orders WHERE id = ?', [id]);
    return result.changes > 0;
}


// --- Users ---
async function getUsers() {
    return all('SELECT id, username, email FROM users ORDER BY id;');
}

async function getUserByUsername(username) {
    return get('SELECT * FROM users WHERE username = ?', [username]);
}

async function getUserById(id) {
    return get('SELECT * FROM users WHERE id = ?', [id]);
}

async function getOrdersByUserId(userId) {
    const orders = await all('SELECT * FROM orders WHERE user_id = ?', [userId]);
    return orders.map(normalizeOrder);
}

async function getUserByEmail(email) {
    return get('SELECT * FROM users WHERE email = ?', [email]);
}

async function createUser(userData) {
    const password_hash = await bcrypt.hash(userData.password, 10);
    const sql = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)';
    const result = await run(sql, [userData.username, userData.email, password_hash]);
    return getUserById(result.lastID);
}

async function deleteUser(id) {
    const result = await run('DELETE FROM users WHERE id = ?', [id]);
    return result.changes > 0;
}

module.exports = {
    getOrders,
    getOrderByTrackingNumber,
    getOrdersByPhone,
    createOrder,
    updateOrder,
    deleteOrder,
    getUsers,
    getUserById,
    getUserByUsername,
    getUserByEmail,
    createUser,
    deleteUser,
    getOrdersByUserId,
};
