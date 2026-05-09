import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

def reset_admin():
    db = SessionLocal()
    try:
        # Buscar el admin por el correo que el usuario mencionó o el estándar
        admin_email = "admin@gmail.com"
        user = db.query(User).filter(User.email == admin_email).first()
        
        if not user:
            print(f"Creando nuevo admin: {admin_email}")
            user = User(
                nombre="Administrador",
                email=admin_email,
                role="admin",
                activo=True
            )
            db.add(user)
        else:
            print(f"Actualizando admin existente: {admin_email}")
            user.activo = True
            user.role = "admin"
            
        user.password_hash = get_password_hash("123456")
        db.commit()
        print("Password de Admin reseteado a: 123456")
        
        # También vamos a crear admin@admin.com por si acaso
        admin2_email = "admin@admin.com"
        user2 = db.query(User).filter(User.email == admin2_email).first()
        if not user2:
            print(f"Creando respaldo: {admin2_email}")
            user2 = User(
                nombre="Admin Respaldo",
                email=admin2_email,
                role="admin",
                activo=True,
                password_hash=get_password_hash("123456")
            )
            db.add(user2)
            db.commit()
            print("Admin de respaldo creado: 123456")
            
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_admin()
