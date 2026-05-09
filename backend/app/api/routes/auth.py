from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings


router = APIRouter(prefix="/auth", tags=["auth"])


# 📦 DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 📄 SCHEMAS
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    nombre: str
    email: EmailStr
    telefono: Optional[str] = None
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    token: str
    new_password: str


# ✅ REGISTER
@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == data.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    user = User(
        nombre=data.nombre,
        email=data.email,
        telefono=data.telefono,
        password_hash=get_password_hash(data.password),
        role="admin" if data.email == "admin@admin.com" else "user",
        activo=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(
        {"sub": str(user.id), "email": user.email, "type": "access"}
    )


    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "nombre": user.nombre,
            "email": user.email,
            "telefono": user.telefono,
            "role": user.role,
            "activo": user.activo,
        },
    }


# ✅ LOGIN
@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="Usuario no existe")

    if not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")

    if not user.activo:
        raise HTTPException(status_code=403, detail="Usuario inactivo")

    access_token = create_access_token(
        {"sub": str(user.id), "email": user.email, "type": "access"}
    )


    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "nombre": user.nombre,
            "email": user.email,
            "telefono": user.telefono,
            "role": user.role,
            "activo": user.activo,
        },
    }


# 👤 ME (opcional)
@router.get("/me")
def get_me():
    return {"message": "Usuario autenticado (implementar si necesitas validar token real)"}


# 🔐 FORGOT PASSWORD
@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        print(f"⚠️  SOLICITUD DE RECUPERACIÓN: Email '{data.email}' NO encontrado en la base de datos.")
        return {"message": "Si el correo coincide, recibirás un token"}


    # Token estático para simplificar pruebas en desarrollo (solicitud del usuario)
    otp = "1234"
    user.otp_code = otp
    user.otp_expiration = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    db.commit()

    # 🔥 IMPRIME EN TERMINAL (Mensaje solicitado por el usuario)
    print("\n-------------------------------------------")
    print(f"Aca esta el numero de confirmacion: {otp}")
    print(f"Para el usuario: {user.email}")
    print("-------------------------------------------\n")


    return {
        "message": "Se generó el código",
        "email": user.email,
        "token": otp
    }



# 🔁 RESET PASSWORD
@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Validar código
    if not user.otp_code or user.otp_code != data.token:
        raise HTTPException(status_code=400, detail="Código de validación incorrecto")

    # Validar expiración
    if not user.otp_expiration or datetime.now(timezone.utc) > user.otp_expiration.replace(tzinfo=timezone.utc):
        raise HTTPException(status_code=400, detail="El código ha expirado")

    # Actualizar contraseña
    user.password_hash = get_password_hash(data.new_password)
    
    # Limpiar el código usado
    user.otp_code = None
    user.otp_expiration = None
    
    db.commit()

    return {"message": "Contraseña actualizada correctamente"}