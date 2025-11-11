#!/usr/bin/env python3
"""
Simple HTTP server that serves static files and provides basic API endpoints
for the tracking app (until Node.js is properly installed).
"""

import json
import os
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import hashlib
import time
from datetime import datetime

# Data storage (in-memory for now)
DB_FILE = 'db.json'

def load_db():
    """Load data from db.json"""
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, 'r') as f:
                return json.load(f)
        except:
            pass
    return {"orders": [], "users": []}

def save_db(data):
    """Save data to db.json"""
    with open(DB_FILE, 'w') as f:
        json.dump(data, f, indent=2)

class APIHandler(SimpleHTTPRequestHandler):
    """Custom HTTP handler for static files + API"""
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # API endpoints
        if path.startswith('/api/'):
            self.handle_api_get(path)
        else:
            # Serve static files
            super().do_GET()
    
    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if path.startswith('/api/'):
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                data = json.loads(body)
            except:
                data = {}
            
            self.handle_api_post(path, data)
        else:
            self.send_error(404)
    
    def do_PUT(self):
        """Handle PUT requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if path.startswith('/api/'):
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                data = json.loads(body)
            except:
                data = {}
            
            self.handle_api_put(path, data)
        else:
            self.send_error(404)
    
    def do_DELETE(self):
        """Handle DELETE requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if path.startswith('/api/'):
            self.handle_api_delete(path)
        else:
            self.send_error(404)
    
    def handle_api_get(self, path):
        """Handle GET API requests"""
        db = load_db()
        
        if path == '/api/orders':
            self.send_json(200, db.get('orders', []))
        
        elif path == '/api/users':
            self.send_json(200, db.get('users', []))
        
        elif path.startswith('/api/track/'):
            tracking_num = path.split('/api/track/')[-1]
            orders = db.get('orders', [])
            # Try both trackingNumber and tracking_number fields
            order = next((o for o in orders if o.get('trackingNumber') == tracking_num or o.get('tracking_number') == tracking_num), None)
            if order:
                self.send_json(200, order)
            else:
                self.send_json(404, {'error': f'Order {tracking_num} not found'})
        
        elif path.startswith('/api/orders/'):
            order_id = path.split('/api/orders/')[-1]
            orders = db.get('orders', [])
            order = next((o for o in orders if o.get('id') == order_id), None)
            if order:
                self.send_json(200, order)
            else:
                self.send_json(404, {'error': 'Order not found'})
        
        else:
            self.send_json(404, {'error': 'Not found'})
    
    def handle_api_post(self, path, data):
        """Handle POST API requests"""
        db = load_db()
        
        if path == '/api/orders':
            # Create new order
            from uuid import uuid4
            import random
            import string
            
            # Generate tracking number if not provided
            tracking_num = data.get('trackingNumber') or data.get('tracking_number')
            if not tracking_num or tracking_num.strip() == '':
                # Generate a random SCS tracking number
                tracking_num = 'SCS' + ''.join(random.choices(string.digits, k=5))
            
            order = {
                'id': str(uuid4()),
                'trackingNumber': tracking_num,
                'tracking_number': tracking_num,
                'sender_name': data.get('sender_name', 'Unknown'),
                'sender_address': data.get('sender_address', 'Unknown'),
                'receiver_name': data.get('receiver_name', 'Unknown'),
                'receiver_address': data.get('receiver_address', 'Unknown'),
                'parcel_description': data.get('parcel_description', 'Package'),
                'service': data.get('service', 'Standard'),
                'weight': float(data.get('weight', 1.0)),
                'carrier': data.get('carrier', 'SCS Logistics'),
                'status': data.get('status', 'Shipment Created'),
                'location': data.get('location', 'Origin Facility'),
                'latitude': float(data.get('latitude', 40.7128)),
                'longitude': float(data.get('longitude', -74.006)),
                'estimated_delivery': data.get('estimated_delivery', ''),
                'history': [
                    {
                        'status': data.get('status', 'Shipment Created'),
                        'location': data.get('location', 'Origin Facility'),
                        'date': datetime.now().strftime('%Y-%m-%d')
                    }
                ],
                'createdAt': datetime.now().isoformat()
            }
            db['orders'].append(order)
            save_db(db)
            self.send_json(201, order)
        
        elif path == '/api/register':
            # Register user
            from uuid import uuid4
            user = {
                'id': str(uuid4()),
                'username': data.get('username', ''),
                'email': data.get('email', ''),
                'password': hashlib.sha256(data.get('password', '').encode()).hexdigest(),
                'createdAt': datetime.now().isoformat()
            }
            db['users'].append(user)
            save_db(db)
            self.send_json(201, {'id': user['id'], 'username': user['username']})
        
        elif path == '/api/login':
            # Login user
            username = data.get('username', '')
            password = data.get('password', '')
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            user = next((u for u in db.get('users', []) if u.get('username') == username), None)
            if user and user.get('password') == password_hash:
                self.send_json(200, {'token': 'dummy-token-' + str(int(time.time())), 'username': username})
            else:
                self.send_json(401, {'error': 'Invalid credentials'})
        
        else:
            self.send_json(404, {'error': 'Not found'})
    
    def handle_api_put(self, path, data):
        """Handle PUT API requests"""
        db = load_db()
        
        if path.startswith('/api/orders/'):
            order_id = path.split('/api/orders/')[-1]
            orders = db.get('orders', [])
            order = next((o for o in orders if o.get('id') == order_id), None)
            if order:
                order.update(data)
                save_db(db)
                self.send_json(200, order)
            else:
                self.send_json(404, {'error': 'Order not found'})
        else:
            self.send_json(404, {'error': 'Not found'})
    
    def handle_api_delete(self, path):
        """Handle DELETE API requests"""
        db = load_db()
        
        if path.startswith('/api/orders/'):
            order_id = path.split('/api/orders/')[-1]
            orders = db.get('orders', [])
            original_len = len(orders)
            db['orders'] = [o for o in orders if o.get('id') != order_id]
            if len(db['orders']) < original_len:
                save_db(db)
                self.send_json(200, {'success': True})
            else:
                self.send_json(404, {'error': 'Order not found'})
        
        elif path.startswith('/api/users/'):
            user_id = path.split('/api/users/')[-1]
            users = db.get('users', [])
            original_len = len(users)
            db['users'] = [u for u in users if u.get('id') != user_id]
            if len(db['users']) < original_len:
                save_db(db)
                self.send_json(200, {'success': True})
            else:
                self.send_json(404, {'error': 'User not found'})
        
        else:
            self.send_json(404, {'error': 'Not found'})
    
    def send_json(self, status_code, response_data):
        """Send JSON response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode('utf-8'))
    
    def end_headers(self):
        """Add CORS headers to all responses"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    PORT = 5000
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, APIHandler)
    
    print(f"✓ Server running on http://localhost:{PORT}")
    print(f"✓ Tracking page: http://localhost:{PORT}")
    print(f"✓ Owner dashboard: http://localhost:{PORT}/owner.html")
    print(f"✓ Press Ctrl+C to stop")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n✓ Server stopped")
        sys.exit(0)
