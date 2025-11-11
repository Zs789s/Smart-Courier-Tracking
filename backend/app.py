from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import os
import json
import jwt
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key'  # In production, use a secure secret key
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tracking_number = db.Column(db.String(20), unique=True, nullable=False)
    carrier = db.Column(db.String(50), nullable=False)
    service = db.Column(db.String(50), nullable=False)
    weight = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Float, nullable=False, default=0)
    longitude = db.Column(db.Float, nullable=False, default=0)
    estimated_delivery = db.Column(db.String(50), nullable=False)
    history = db.Column(db.Text, nullable=False) # Storing history as JSON string

    def __repr__(self):
        return f"Order('{self.tracking_number}', '{self.status}')"

with app.app_context():
    db.create_all()
    # Add some initial data if the database is empty
    if not Order.query.first():
        order1 = Order(
            tracking_number="SCS12345",
            carrier="SCS Logistics",
            service="Express",
            weight=2.5,
            status="In Transit",
            location="City A Hub",
            latitude=40.7128,  # New York coordinates
            longitude=-74.0060,
            estimated_delivery="November 8, 2025",
            history=json.dumps([
                {"status": "In Transit", "location": "City A Hub", "date": "2025-11-07"},
                {"status": "Package Processed", "location": "Origin Facility", "date": "2025-11-06"},
                {"status": "Shipment Created", "location": "Sender's Location", "date": "2025-11-06"}
            ])
        )
        order2 = Order(
            tracking_number="SCS67890",
            carrier="SCS Logistics",
            service="Standard",
            weight=5.0,
            status="Delivered",
            location="Customer's Address",
            latitude=34.0522,  # Los Angeles coordinates
            longitude=-118.2437,
            estimated_delivery="November 7, 2025",
            history=json.dumps([
                {"status": "Delivered", "location": "Customer's Address", "date": "2025-11-07"},
                {"status": "Out for Delivery", "location": "Local Distribution Center", "date": "2025-11-07"},
                {"status": "Package Arrived", "location": "Local Distribution Center", "date": "2025-11-06"},
                {"status": "Shipment Created", "location": "Sender's Location", "date": "2025-11-05"}
            ])
        )
        db.session.add(order1)
        db.session.add(order2)
        db.session.commit()

@app.route('/api/track/<string:tracking_number>', methods=['GET'])
def track_order(tracking_number):
    order = Order.query.filter_by(tracking_number=tracking_number).first()
    if order:
        return jsonify({
            'tracking_number': order.tracking_number,
            'carrier': order.carrier,
            'service': order.service,
            'weight': order.weight,
            'status': order.status,
            'location': order.location,
            'latitude': order.latitude,
            'longitude': order.longitude,
            'estimated_delivery': order.estimated_delivery,
            'history': json.loads(order.history)
        })
    return jsonify({'message': 'Order not found'}), 404

@app.route('/api/orders', methods=['POST'])
def create_order():
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Invalid data'}), 400

    # Generate a simple tracking number (for demonstration)
    # In a real app, this would be more robust
    new_tracking_number = "SCS" + str(Order.query.count() + 10000)

    new_order = Order(
        tracking_number=new_tracking_number,
        carrier=data.get('carrier', 'SCS Logistics'),
        service=data.get('service', 'Standard'),
        weight=data.get('weight', 0.0),
        status="Pending",
        location="Order Placed",
        latitude=data.get('latitude', 40.7128),  # Default to New York coordinates
        longitude=data.get('longitude', -74.0060),
        estimated_delivery="To be determined",
        history=json.dumps([{"status": "Order Placed", "location": "Customer Request", "date": "2025-11-07"}])
    )

    db.session.add(new_order)
    db.session.commit()

    return jsonify({'message': 'Order created successfully', 'tracking_number': new_tracking_number}), 201

@app.route('/api/orders', methods=['GET'])
def get_orders():
    orders = Order.query.all()
    return jsonify({'orders': [{
        'id': order.id,
        'tracking_number': order.tracking_number,
        'carrier': order.carrier,
        'service': order.service,
        'weight': order.weight,
        'status': order.status,
        'location': order.location,
        'latitude': order.latitude,
        'longitude': order.longitude,
        'estimated_delivery': order.estimated_delivery,
        'history': json.loads(order.history)
    } for order in orders]})

@app.route('/api/orders/<int:order_id>', methods=['PUT'])
def update_order(order_id):
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Invalid data'}), 400

    order = Order.query.get(order_id)
    if not order:
        return jsonify({'message': 'Order not found'}), 404

    # Allowed fields to update
    fields = ['status', 'location', 'latitude', 'longitude', 'estimated_delivery', 'carrier', 'service', 'weight', 'history']
    for f in fields:
        if f in data:
            if f == 'history':
                # Expect list for history
                try:
                    order.history = json.dumps(data['history'])
                except Exception:
                    # fallback: store as string
                    order.history = json.dumps([{'note': str(data['history']), 'date': datetime.utcnow().strftime('%Y-%m-%d')}])
            else:
                setattr(order, f, data[f])

    db.session.commit()

    return jsonify({
        'message': 'Order updated successfully',
        'order': {
            'id': order.id,
            'tracking_number': order.tracking_number,
            'carrier': order.carrier,
            'service': order.service,
            'weight': order.weight,
            'status': order.status,
            'location': order.location,
            'latitude': order.latitude,
            'longitude': order.longitude,
            'estimated_delivery': order.estimated_delivery,
            'history': json.loads(order.history)
        }
    }), 200

@app.route('/api/orders/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    order = Order.query.get(order_id)
    if order:
        db.session.delete(order)
        db.session.commit()
        return jsonify({'message': 'Order deleted successfully'}), 200
    return jsonify({'message': 'Order not found'}), 404

@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify({'users': [{'id': user.id, 'username': user.username, 'email': user.email} for user in users]})

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if user:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully'}), 200
    return jsonify({'message': 'User not found'}), 404

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields'}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 400

    user = User(username=data['username'], email=data['email'])
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'User created successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Missing username or password'}), 400

    user = User.query.filter_by(username=data['username']).first()

    if user and user.check_password(data['password']):
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(days=1)
        }, app.config['SECRET_KEY'])
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'username': user.username
        })

    return jsonify({'message': 'Invalid username or password'}), 401

if __name__ == '__main__':
    app.run(debug=True, port=5000)