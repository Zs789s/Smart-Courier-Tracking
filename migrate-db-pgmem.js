const { newDb } = require('pg-mem');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');

async function runPgMemMigration() {
  const DB_FILE = path.join(__dirname, 'db.json');

  // Create an in-memory Postgres instance
  const db = newDb();
  const { Client } = db.adapters.createPg();
  const { nanoid } = require('nanoid');
  const client = new Client();

  try {
    await client.connect();
    console.log('Connected to in-memory PostgreSQL (pg-mem).');

    // Create schema (same as migrate-db.js)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(80) UNIQUE NOT NULL,
          email VARCHAR(120) UNIQUE NOT NULL,
          password_hash VARCHAR(128) NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          tracking_number VARCHAR(20) UNIQUE NOT NULL,
          trackingNumber VARCHAR(20) UNIQUE,
          sender_name VARCHAR(255),
          sender_phone VARCHAR(50),
          sender_address TEXT,
          sender_latitude DOUBLE PRECISION,
          sender_longitude DOUBLE PRECISION,
          receiver_name VARCHAR(255),
          receiver_phone VARCHAR(50),
          receiver_address TEXT,
          receiver_latitude DOUBLE PRECISION,
          receiver_longitude DOUBLE PRECISION,
          parcel_description TEXT,
          value DOUBLE PRECISION,
          special_instructions TEXT,
          carrier VARCHAR(50),
          service VARCHAR(50),
          weight DOUBLE PRECISION,
          status VARCHAR(50),
          location TEXT,
          latitude DOUBLE PRECISION,
          longitude DOUBLE PRECISION,
          estimated_delivery VARCHAR(50),
          history JSONB,
          user_id INTEGER REFERENCES users(id)
      );
    `);

    // Load db.json
    let dbData = { users: [], orders: [] };
    try {
      const content = await fs.readFile(DB_FILE, 'utf8');
      dbData = JSON.parse(content);
    } catch (e) {
      console.warn('db.json not found or invalid, skipping data population in pg-mem.');
    }

    // Insert users (normalize fields, provide safe defaults)
    if (dbData.users && dbData.users.length > 0) {
      let insertedUsers = 0;
      for (const user of dbData.users) {
        const username = (user.username || '').toString().trim();
        if (!username) continue; // skip invalid user entries
        const email = (user.email || `${username}@example.local`).toString().trim();
        // Prefer existing password_hash, fall back to password, otherwise create a placeholder hash
        let passwordHash = user.password_hash || user.password || null;
        if (!passwordHash) {
          // create a default placeholder password hash so NOT NULL constraint is satisfied
          passwordHash = bcrypt.hashSync('change-this-password', 8);
        }

        try {
          await client.query(
            `INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) ON CONFLICT (username) DO NOTHING;`,
            [username, email, passwordHash]
          );
          insertedUsers++;
        } catch (e) {
          // log and continue
          console.warn(`pg-mem: failed to insert user ${username}:`, e.message || e);
        }
      }
      console.log(`pg-mem: inserted ${insertedUsers} users (of ${dbData.users.length} source users).`);
    }

    // Insert orders
    if (dbData.orders && dbData.orders.length > 0) {
      let insertedOrders = 0;
      for (const order of dbData.orders) {
        // normalize and provide defaults
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
        const user_id = order.user_id || null;

        try {
          await client.query(
            `INSERT INTO orders (
                tracking_number, trackingNumber, sender_name, sender_phone, sender_address, sender_latitude, sender_longitude,
                receiver_name, receiver_phone, receiver_address, receiver_latitude, receiver_longitude,
                parcel_description, value, special_instructions, carrier, service, weight, status, location,
                latitude, longitude, estimated_delivery, history, user_id
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25) ON CONFLICT (tracking_number) DO NOTHING;`,
            [
              tracking_number, trackingNumber,
              sender_name, sender_phone, sender_address, sender_latitude, sender_longitude,
              receiver_name, receiver_phone, receiver_address, receiver_latitude, receiver_longitude,
              parcel_description, value, special_instructions,
              carrier, service, weight, status, location,
              latitude, longitude, estimated_delivery,
              history, user_id
            ]
          );
          insertedOrders++;
        } catch (e) {
          console.warn(`pg-mem: failed to insert order (tracking_number=${tracking_number}):`, e.message || e);
        }
      }
      console.log(`pg-mem: inserted ${insertedOrders} orders (of ${dbData.orders.length} source orders).`);
    }

    // Show counts
    const usersCount = await client.query('SELECT COUNT(*) as c FROM users');
    const ordersCount = await client.query('SELECT COUNT(*) as c FROM orders');
    console.log(`pg-mem: users=${usersCount.rows[0].c} orders=${ordersCount.rows[0].c}`);

    console.log('In-memory migration completed. This verifies the migration logic without a system PostgreSQL server.');
  } catch (err) {
    console.error('pg-mem migration failed:', err);
    process.exit(1);
  } finally {
    try { await client.end(); } catch (e) {}
  }
}

runPgMemMigration();
