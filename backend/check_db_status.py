import os
from app.db.session import DATABASE_URL, engine
from sqlalchemy import inspect

print(f"DATABASE_URL en uso: {DATABASE_URL}")
print(f"¿Existe el archivo?: {os.path.exists(DATABASE_URL.replace('sqlite:///', ''))}")

inspector = inspect(engine)
tables = inspector.get_table_names()
print(f"Tablas encontradas: {tables}")

if "users" in tables:
    from app.db.session import SessionLocal
    from app.models.user import User
    db = SessionLocal()
    users = db.query(User).all()
    print(f"Usuarios en la base de datos: {[u.email for u in users]}")
    db.close()
