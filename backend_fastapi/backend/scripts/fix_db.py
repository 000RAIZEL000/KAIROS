import sqlite3
import os

import sys
db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "kairos.db")
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
