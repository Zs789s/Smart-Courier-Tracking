const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');

const DB_FILE = path.join(__dirname, 'data.sqlite');
const JSON_FILE = path.join(__dirname, 'db.json');

async function runMigration() {
  // remove existing DB if you want a fresh start? We keep and create if missing
  const db = new sqlite3.Database(DB_FILE);

  function run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve(this);
      });
    });
  }

  function all(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  try {
    // Create tables (nullable fields to support legacy data)
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
      );
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tracking_number TEXT UNIQUE NOT NULL,
        trackingNumber TEXT,
        sender_name TEXT,
        sender_phone TEXT,
        sender_address TEXT,
        sender_latitude REAL,
        sender_longitude REAL,
        receiver_name TEXT,
        receiver_phone TEXT,
        receiver_address TEXT,
        receiver_latitude REAL,
        receiver_longitude REAL,
        parcel_description TEXT,
        value REAL,
        special_instructions TEXT,
        carrier TEXT,
        service TEXT,
        weight REAL,
        status TEXT,
        location TEXT,
        latitude REAL,
        longitude REAL,
        estimated_delivery TEXT,
        history TEXT,
        country TEXT DEFAULT 'GLOBAL',
        user_id INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
    `);

    // Load db.json
    let dbData = { users: [], orders: [] };
    try {
      const content = await fs.readFile(JSON_FILE, 'utf8');
      dbData = JSON.parse(content);
    } catch (e) {
      console.warn('db.json not found or invalid, skipping migration.');
      db.close();
      return;
    }

    // Insert users
    if (dbData.users && dbData.users.length > 0) {
      const insertUserSql = `INSERT OR IGNORE INTO users (username, email, password_hash) VALUES (?, ?, ?)`;
      let inserted = 0;
      for (const user of dbData.users) {
        const username = (user.username || '').toString().trim();
        if (!username) continue;
        const email = (user.email || `${username}@example.local`).toString().trim();
        let passwordHash = user.password_hash || user.password || null;
        if (!passwordHash) {
          passwordHash = bcrypt.hashSync('change-this-password', 8);
        }
        await run(insertUserSql, [username, email, passwordHash]);
        inserted++;
      }
      console.log(`SQLite: inserted ${inserted} users (of ${dbData.users.length} source users).`);
    }

    // Map usernames to ids for user_id references
    const usersRows = await all('SELECT id, username FROM users');
    const usernameToId = Object.fromEntries(usersRows.map(r => [r.username, r.id]));

    // Insert orders
    if (dbData.orders && dbData.orders.length > 0) {
      const insertOrderSql = `INSERT OR IGNORE INTO orders (
        tracking_number, trackingNumber, sender_name, sender_phone, sender_address, sender_latitude, sender_longitude,
        receiver_name, receiver_phone, receiver_address, receiver_latitude, receiver_longitude,
        parcel_description, value, special_instructions, carrier, service, weight, status, location,
        latitude, longitude, estimated_delivery, history, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      let insertedOrders = 0;
      for (const order of dbData.orders) {
        const tracking_number = order.tracking_number || order.trackingNumber || nanoid(10);
        const trackingNumber = order.trackingNumber || order.tracking_number || tracking_number;
        const sender_name = order.sender_name || order.senderName || null;
        const sender_phone = order.sender_phone || order.senderPhone || null;
        const sender_address = order.sender_address || order.senderAddress || null;
        const sender_latitude = order.sender_latitude ?? order.senderLatitude ?? null;
        const sender_longitude = order.sender_longitude ?? order.senderLongitude ?? null;
        const receiver_name = order.receiver_name || order.receiverName || null;
        const receiver_phone = order.receiver_phone || order.receiverPhone || null;
        const receiver_address = order.receiver_address || order.receiverAddress || null;
        const receiver_latitude = order.receiver_latitude ?? order.receiverLatitude ?? null;
        const receiver_longitude = order.receiver_longitude ?? order.receiverLongitude ?? null;
        const parcel_description = order.parcel_description || order.parcelDescription || null;
        const value = order.value ?? null;
        const special_instructions = order.special_instructions || order.specialInstructions || null;
        const carrier = order.carrier || null;
        const service = order.service || null;
        const weight = order.weight ?? null;
        const status = order.status || null;
        const location = order.location || null;
        const latitude = order.latitude ?? null;
        const longitude = order.longitude ?? null;
        const estimated_delivery = order.estimated_delivery || order.estimatedDelivery || null;
        const history = JSON.stringify(order.history || []);
        let user_id = null;
        if (order.username) user_id = usernameToId[order.username] || null;
        if (!user_id && order.user_id) user_id = order.user_id;

        try {
          await run(insertOrderSql, [
            tracking_number, trackingNumber, sender_name, sender_phone, sender_address, sender_latitude, sender_longitude,
            receiver_name, receiver_phone, receiver_address, receiver_latitude, receiver_longitude,
            parcel_description, value, special_instructions, carrier, service, weight, status, location,
            latitude, longitude, estimated_delivery, history, user_id
          ]);
          insertedOrders++;
        } catch (e) {
          console.warn(`SQLite: failed to insert order (tracking_number=${tracking_number}):`, e.message || e);
        }
      }
      console.log(`SQLite: inserted ${insertedOrders} orders (of ${dbData.orders.length} source orders).`);
    }

    // Show counts
    const usersCountRow = await all('SELECT COUNT(*) as c FROM users');
    const ordersCountRow = await all('SELECT COUNT(*) as c FROM orders');
    console.log(`SQLite: users=${usersCountRow[0].c} orders=${ordersCountRow[0].c}`);

    console.log('SQLite migration completed. Database file:', DB_FILE);
  } catch (err) {
    console.error('SQLite migration failed:', err);
  } finally {
    db.close();
  }
}

runMigration();
