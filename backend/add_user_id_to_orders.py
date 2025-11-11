import sqlite3
import os

def add_user_id_to_orders(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Add user_id column to the 'order' table
        cursor.execute("ALTER TABLE 'order' ADD COLUMN user_id INTEGER;")
        print("Added user_id column to 'order' table.")

        # For existing orders, assign a default user_id (e.g., 1)
        # This assumes a user with id=1 exists or will exist.
        cursor.execute("UPDATE 'order' SET user_id = 1 WHERE user_id IS NULL;")
        print("Updated existing orders with default user_id = 1.")

        conn.commit()
        print("Database changes committed successfully.")

    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("Column 'user_id' already exists in 'order' table. Skipping ALTER TABLE.")
        else:
            print(f"SQLite Operational Error: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    db_file = os.path.join(script_dir, "instance", "site.db")
    add_user_id_to_orders(db_file)