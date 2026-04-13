from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

# 🔐 CONFIG
SECRET_KEY = "kairos-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
RESET_TOKEN_EXPIRE_MINUTES = 30


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
    token: str
    new_password: str


# 🔑 TOKEN
def create_token(data: dict, expires_minutes: int) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
        )


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

    access_token = create_token(
        {"sub": user.email, "user_id": user.id, "type": "access"},
        ACCESS_TOKEN_EXPIRE_MINUTES,
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

    access_token = create_token(
        {"sub": user.email, "user_id": user.id, "type": "access"},
        ACCESS_TOKEN_EXPIRE_MINUTES,
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
        return {"message": "Si el correo existe, se generó un token"}

    reset_token = create_token(
        {"sub": user.email, "user_id": user.id, "type": "reset"},
        RESET_TOKEN_EXPIRE_MINUTES,
    )

    # 🔥 IMPRIME EN TERMINAL
    print("\n🔐 ===== RECUPERACIÓN DE CONTRASEÑA =====")
    print(f"📧 Email: {user.email}")
    print(f"🔑 Token: {reset_token}")
    print("========================================\n")

    return {
        "message": "Se generó el token (revisar terminal)"
    }


# 🔁 RESET PASSWORD
@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    payload = decode_token(data.token)

    if payload.get("type") != "reset":
        raise HTTPException(status_code=400, detail="Token inválido")

    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user.password_hash = get_password_hash(data.new_password)
    db.commit()

    return {"message": "Contraseña actualizada correctamente"}