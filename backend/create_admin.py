from app.db.session import SessionLocal, engine
from app.models import Base
from app.models.user import User
from app.core.security import hash_password

Base.metadata.create_all(bind=engine)

db = SessionLocal()

email = "admin@gmail.com"

existing = db.query(User).filter(User.email == email).first()

if not existing:
    admin = User(
        nombre="Administrador",
        email=email,
        password_hash=hash_password("123456"),
        role="admin",
        activo=True,
    )
    db.add(admin)
    db.commit()
    print("Admin creado correctamente")
else:
    print("El admin ya existe")

db.close()