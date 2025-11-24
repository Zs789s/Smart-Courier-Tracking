const http = require('http');

const orderData = JSON.stringify({
  sender_name: 'Test User',
  sender_phone: '+1-555-1234',
  sender_address: '123 Test St',
  sender_latitude: 40.7128,
  sender_longitude: -74.0060,
  receiver_name: 'Recipient',
  receiver_phone: '+1-555-5678',
  receiver_address: '456 Test Ave',
  receiver_latitude: 34.0522,
  receiver_longitude: -118.2437,
  parcel_description: 'Test Package',
  service: 'standard',
  weight: 1.5,
  value: 50
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/orders',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': orderData.length
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response:', data);
    
    try {
      const json = JSON.parse(data);
      console.log('\nParsed Response:');
      console.log('Tracking Number:', json.tracking_number || json.trackingNumber);
      console.log('Message:', json.message);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(orderData);
req.end();

setTimeout(() => process.exit(0), 2000);
