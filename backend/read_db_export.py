import sqlite3
import json
import os

def export_db_to_json(db_path, json_path):
    """Export SQLite database contents to JSON file"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get orders with column names
    cursor.execute("SELECT id, tracking_number, carrier, service, weight, status, location, latitude, longitude, estimated_delivery, history, user_id FROM 'order'")
    orders = cursor.fetchall()
    order_columns = [description[0] for description in cursor.description]
    orders_list = []
    
    for order in orders:
        order_dict = dict(zip(order_columns, order))
        # Parse the history JSON string into an array
        try:
            order_dict['history'] = json.loads(order_dict['history'])
        except:
            order_dict['history'] = []
        orders_list.append(order_dict)
    
    # Get users with column names (excluding password_hash for security)
    cursor.execute("SELECT id, username, email FROM user")
    users = cursor.fetchall()
    user_columns = ['id', 'username', 'email']
    users_list = [dict(zip(user_columns, user)) for user in users]
    
    # Create export data
    export_data = {
        'users': users_list,
        'orders_by_user': {}
    }

    # Group orders by user_id
    for order in orders_list:
        user_id = order.get('user_id')
        if user_id not in export_data['orders_by_user']:
            export_data['orders_by_user'][user_id] = []
        export_data['orders_by_user'][user_id].append(order)
    
    # Write to JSON file
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(export_data, f, indent=2, ensure_ascii=False)
    
    # Print the JSON content for verification
    print("\nExported JSON content:")
    print(json.dumps(export_data, indent=2, ensure_ascii=False))
    
    conn.close()
    return len(orders_list), len(users_list)

if __name__ == "__main__":
    # Get the script's directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Construct paths relative to script location
    db_file = os.path.join(script_dir, "instance", "site.db")
    json_file = os.path.join(script_dir, "..", "orders.json")
    
    try:
        orders_count, users_count = export_db_to_json(db_file, json_file)
        print(f"Export successful!")
        print(f"- Orders exported: {orders_count}")
        print(f"- Users exported: {users_count}")
        print(f"File saved as: {os.path.abspath(json_file)}")
    except Exception as e:
        print(f"Error during export: {str(e)}")