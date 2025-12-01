const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_FILE = path.join(__dirname, 'data.sqlite');
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error('Failed to connect:', err.message);
    process.exit(1);
  }
  console.log('✓ Connected to SQLite database\n');
});

// Check tables
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('Error fetching tables:', err);
    return;
  }
  console.log('=== Database Tables ===');
  tables.forEach(t => console.log('  -', t.name));
  console.log();
  
  // Check schemas
  tables.forEach(table => {
    db.all(`PRAGMA table_info(${table.name})`, (err, columns) => {
      if (err) {
        console.error(`Error fetching schema for ${table.name}:`, err);
        return;
      }
      console.log(`\n--- Table: ${table.name} ---`);
      columns.forEach(col => {
        console.log(`  ${col.name}: ${col.type}${col.notnull ? ' NOT NULL' : ''}${col.pk ? ' PRIMARY KEY' : ''}`);
      });
    });
  });

  // Check data counts
  db.all('SELECT COUNT(*) as count FROM users', (err, result) => {
    if (err) console.error('Users count error:', err);
    else console.log('\n✓ Users:', result[0].count);
  });

  db.all('SELECT COUNT(*) as count FROM orders', (err, result) => {
    if (err) console.error('Orders count error:', err);
    else console.log('✓ Orders:', result[0].count);
  });

  // List sample users
  db.all('SELECT id, username, email FROM users LIMIT 5', (err, users) => {
    if (err) {
      console.error('Error fetching users:', err);
      return;
    }
    console.log('\n=== Sample Users ===');
    users.forEach(u => console.log(`  ${u.id}: ${u.username} (${u.email})`));
  });

  // List sample orders
  db.all('SELECT id, tracking_number, status FROM orders LIMIT 5', (err, orders) => {
    if (err) {
      console.error('Error fetching orders:', err);
      db.close();
      return;
    }
    console.log('\n=== Sample Orders ===');
    orders.forEach(o => console.log(`  ${o.id}: ${o.tracking_number} - ${o.status}`));
    console.log('\n✓ Database validation complete!\n');
    db.close();
  });
});
