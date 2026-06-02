# Este archivo existe por compatibilidad.
# La fuente real del engine es app/db/session.py
from app.db.session import engine, SessionLocal

__all__ = ["engine", "SessionLocal"]