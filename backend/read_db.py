
import sqlite3
import json

def read_database(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("--- Orders Table ---")
    cursor.execute("SELECT * FROM 'order'")
    orders = cursor.fetchall()
    order_columns = [description[0] for description in cursor.description]
    for order in orders:
        print(dict(zip(order_columns, order)))

    print("\n--- Users Table ---")
    cursor.execute("SELECT * FROM user")
    users = cursor.fetchall()
    user_columns = [description[0] for description in cursor.description]
    for user in users:
        print(dict(zip(user_columns, user)))

    conn.close()

if __name__ == "__main__":
    db_file = "c:\\Users\\Muaaz\\Desktop\\web-project\\backend\\instance\\site.db"
    read_database(db_file)
