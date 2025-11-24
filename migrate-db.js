
const { Client } = require('pg');
const path = require('path');
const fs = require('fs').promises;

const DB_FILE = path.join(__dirname, 'db.json');
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/mydatabase'; // Default for local testing

async function runMigration() {
    const client = new Client({
        connectionString: DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connected to PostgreSQL for migration.');

        // 1. Create users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(80) UNIQUE NOT NULL,
                email VARCHAR(120) UNIQUE NOT NULL,
                password_hash VARCHAR(128) NOT NULL
            );
        `);
        console.log('Users table ensured.');

        // 2. Create orders table
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
        console.log('Orders table ensured.');

        // 3. Migrate data from db.json if it exists and tables are empty
        let dbData = { users: [], orders: [] };
        try {
            const dbFileContent = await fs.readFile(DB_FILE, 'utf8');
            dbData = JSON.parse(dbFileContent);
        } catch (e) {
            console.warn('db.json not found or invalid, skipping data migration.');
        }

        // Migrate users
        if (dbData.users && dbData.users.length > 0) {
            const { rows } = await client.query('SELECT COUNT(*) FROM users;');
            if (parseInt(rows[0].count) === 0) {
                for (const user of dbData.users) {
                    try {
                        await client.query(
                            `INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) ON CONFLICT (username) DO NOTHING;`,
                            [user.username, user.email, user.password_hash]
                        );
                    } catch (insertErr) {
                        console.error(`Error inserting user ${user.username}:`, insertErr.message);
                    }
                }
                console.log(`Migrated ${dbData.users.length} users.`);
            } else {
                console.log('Users table already contains data, skipping user migration.');
            }
        }

        // Migrate orders
        if (dbData.orders && dbData.orders.length > 0) {
            const { rows } = await client.query('SELECT COUNT(*) FROM orders;');
            if (parseInt(rows[0].count) === 0) {
                for (const order of dbData.orders) {
                    try {
                        await client.query(
                            `INSERT INTO orders (
                                tracking_number, trackingNumber, sender_name, sender_phone, sender_address, sender_latitude, sender_longitude,
                                receiver_name, receiver_phone, receiver_address, receiver_latitude, receiver_longitude,
                                parcel_description, value, special_instructions, carrier, service, weight, status, location,
                                latitude, longitude, estimated_delivery, history, user_id
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
                            ON CONFLICT (tracking_number) DO NOTHING;`,
                            [
                                order.tracking_number, order.trackingNumber || order.tracking_number,
                                order.sender_name, order.sender_phone, order.sender_address, order.sender_latitude, order.sender_longitude,
                                order.receiver_name, order.receiver_phone, order.receiver_address, order.receiver_latitude, order.receiver_longitude,
                                order.parcel_description, order.value, order.special_instructions,
                                order.carrier, order.service, order.weight, order.status, order.location,
                                order.latitude, order.longitude, order.estimated_delivery,
                                JSON.stringify(order.history || []), order.user_id || null
                            ]
                        );
                    } catch (insertErr) {
                        console.error(`Error inserting order ${order.tracking_number}:`, insertErr.message);
                    }
                }
                console.log(`Migrated ${dbData.orders.length} orders.`);
            } else {
                console.log('Orders table already contains data, skipping order migration.');
            }
        }

    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        await client.end();
        console.log('PostgreSQL connection closed.');
    }
}

runMigration();
