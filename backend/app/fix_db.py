import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "kairos_ag.db")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("DROP TABLE torneos")
    conn.commit()
    print("Tabla torneos eliminada exitosamente.")
except Exception as e:
    print("Error:", e)
finally:
    conn.close()
