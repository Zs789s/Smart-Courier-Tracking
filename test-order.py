#!/usr/bin/env python3
import urllib.request
import json

order_data = {
    "sender_name": "Test User",
    "sender_phone": "+1-555-1234",
    "sender_address": "123 Test St",
    "sender_latitude": 40.7128,
    "sender_longitude": -74.0060,
    "receiver_name": "Recipient",
    "receiver_phone": "+1-555-5678",
    "receiver_address": "456 Test Ave",
    "receiver_latitude": 34.0522,
    "receiver_longitude": -118.2437,
    "parcel_description": "Test Package",
    "service": "standard",
    "weight": 1.5,
    "value": 50
}

json_data = json.dumps(order_data).encode('utf-8')

try:
    req = urllib.request.Request(
        'http://localhost:5000/api/orders',
        data=json_data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        print("Status Code:", response.status)
        print("Response:")
        print(json.dumps(result, indent=2))
        print("\nTracking Number:", result.get('tracking_number') or result.get('trackingNumber'))
except Exception as e:
    print(f"Error: {e}")
