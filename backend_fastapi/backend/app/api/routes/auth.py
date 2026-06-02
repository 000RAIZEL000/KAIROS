# =============================================================================
# RUTAS DE AUTENTICACIÓN — /auth
# =============================================================================
# Este archivo define todos los endpoints relacionados con el ciclo de vida
# de la autenticación en Kairos:
#
#   POST /auth/register       → Crea un nuevo usuario y devuelve su JWT
#   POST /auth/login          → Verifica credenciales y devuelve JWT
#   GET  /auth/me             → Placeholder informativo (sin validación real)
#   POST /auth/forgot-password → Genera un OTP de recuperación
#   POST /auth/reset-password  → Cambia la contraseña usando el OTP
#
# Estas rutas son PÚBLICAS (no requieren token) salvo indicación contraria.
# El router se registra en app/api/router.py con prefix="/auth".
# =============================================================================

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


# Instancia del router de FastAPI con prefijo y etiqueta para la documentación Swagger
router = APIRouter(prefix="/auth", tags=["auth"])


# -----------------------------------------------------------------------------
# Dependencia: get_db
# -----------------------------------------------------------------------------
# Generador que abre una sesión de base de datos por cada request y la cierra
# al finalizar (patrón "session-per-request"). Se usa con Depends(get_db).
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()  # Garantiza el cierre aunque ocurra una excepción


# =============================================================================
# SCHEMAS INTERNOS (DTOs de entrada)
# =============================================================================
# Pydantic valida automáticamente que el body del request cumpla estos modelos.
# Si falta un campo requerido o el tipo no coincide, FastAPI devuelve HTTP 422.

# Payload esperado en POST /auth/login
class LoginRequest(BaseModel):
    email: EmailStr   # Valida formato de email
    password: str


# Payload esperado en POST /auth/register
class RegisterRequest(BaseModel):
    nombre: str
    email: EmailStr
    telefono: Optional[str] = None  # Campo opcional para SMS/OTP futuro
    password: str


# Payload esperado en POST /auth/forgot-password
class ForgotPasswordRequest(BaseModel):
    email: EmailStr


# Payload esperado en POST /auth/reset-password
class ResetPasswordRequest(BaseModel):
    email: EmailStr
    token: str         # El código OTP recibido (actualmente "1234" en dev)
    new_password: str


# =============================================================================
# ENDPOINT: Registro de usuario
# =============================================================================
@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    """
    Crea un nuevo usuario en la base de datos y devuelve un JWT de acceso.

    Flujo:
    1. Verifica que el email no esté ya registrado (unicidad)
    2. Asigna role="admin" si el email es admin@admin.com, sino role="user"
    3. Hashea la contraseña con bcrypt antes de persistirla
    4. Genera y devuelve un JWT con {sub, email, type:"access"}
    """
    # Verificar si ya existe un usuario con ese email (restricción unique)
    existing_user = db.query(User).filter(User.email == data.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    # Crear el objeto User con la contraseña hasheada
    user = User(
        nombre=data.nombre,
        email=data.email,
        telefono=data.telefono,
        password_hash=get_password_hash(data.password),  # Nunca se guarda texto plano
        role="admin" if data.email == "admin@admin.com" else "user",
        activo=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)  # Recarga el objeto desde la BD para obtener el ID generado

    # Crear el JWT de acceso con el ID y email del usuario recién creado
    access_token = create_access_token(
        {"sub": str(user.id), "email": user.email, "type": "access"}
    )

    # Devolver el token y los datos públicos del usuario
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


# =============================================================================
# ENDPOINT: Login de usuario
# =============================================================================
@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """
    Autentica un usuario existente y devuelve un JWT de acceso.

    Flujo:
    1. Busca el usuario por email
    2. Verifica la contraseña con bcrypt (verify_password)
    3. Verifica que el usuario esté activo
    4. Genera y devuelve el JWT
    """
    # Buscar usuario por email (campo único e indexado)
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="Usuario no existe")

    # Comparar la contraseña enviada contra el hash almacenado
    if not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")

    # Verificar que la cuenta no esté desactivada por un administrador
    if not user.activo:
        raise HTTPException(status_code=403, detail="Usuario inactivo")

    # Generar JWT con el ID y email del usuario como payload
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


# =============================================================================
# ENDPOINT: Placeholder /auth/me
# =============================================================================
# Placeholder sin validación real. El endpoint funcional de perfil del usuario
# autenticado está en app/api/routes/users.py como GET /users/me
@router.get("/me")
def get_me():
    return {"message": "Usuario autenticado (implementar si necesitas validar token real)"}


# =============================================================================
# ENDPOINT: Solicitar recuperación de contraseña
# =============================================================================
@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Genera un OTP de recuperación y lo guarda en el usuario.

    Flujo:
    1. Busca el usuario por email
    2. Si no existe, devuelve respuesta genérica (evita enumerar usuarios)
    3. Genera otp_code="1234" (valor fijo en desarrollo) y lo guarda con
       una expiración de 10 minutos desde ahora
    4. Imprime el OTP en consola (en producción se enviaría por SMS/email)
    """
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        # Respuesta vaga intencional: no revelar si el email existe en el sistema
        print(f"⚠️  SOLICITUD DE RECUPERACIÓN: Email '{data.email}' NO encontrado en la base de datos.")
        return {"message": "Si el correo coincide, recibirás un token"}

    # Token estático para simplificar pruebas en desarrollo (solicitud del usuario)
    otp = "1234"
    user.otp_code = otp
    # El OTP expirará en 10 minutos a partir de ahora (timezone-aware)
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


# =============================================================================
# ENDPOINT: Restablecer contraseña con OTP
# =============================================================================
@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Cambia la contraseña del usuario tras validar el OTP de recuperación.

    Flujo:
    1. Busca el usuario por email
    2. Valida que el otp_code coincida con el token enviado
    3. Valida que el OTP no haya expirado (compara contra otp_expiration)
    4. Hashea la nueva contraseña y la guarda
    5. Limpia el OTP para que no pueda reutilizarse
    """
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Validar que el código OTP enviado coincida con el almacenado
    if not user.otp_code or user.otp_code != data.token:
        raise HTTPException(status_code=400, detail="Código de validación incorrecto")

    # Validar que el OTP no haya expirado
    # replace(tzinfo=...) necesario si otp_expiration viene sin timezone de la BD
    if not user.otp_expiration or datetime.now(timezone.utc) > user.otp_expiration.replace(tzinfo=timezone.utc):
        raise HTTPException(status_code=400, detail="El código ha expirado")

    # Actualizar la contraseña con el nuevo hash bcrypt
    user.password_hash = get_password_hash(data.new_password)

    # Invalidar el OTP para evitar reutilización (one-time use)
    user.otp_code = None
    user.otp_expiration = None

    db.commit()

    return {"message": "Contraseña actualizada correctamente"}


# =============================================================================
# RESUMEN DEL FLUJO COMPLETO DE AUTENTICACIÓN
# =============================================================================
# ┌─────────────────────────────────────────────────────────────────────────┐
# │  REGISTRO:                                                              │
# │    Cliente → POST /auth/register {nombre, email, password}             │
# │    Servidor → hashea password → guarda User → devuelve JWT             │
# │                                                                         │
# │  LOGIN:                                                                 │
# │    Cliente → POST /auth/login {email, password}                        │
# │    Servidor → verifica hash → verifica activo → devuelve JWT           │
# │                                                                         │
# │  USO DEL TOKEN:                                                         │
# │    Cliente → GET /users/me  Header: "Authorization: Bearer <token>"    │
# │    Servidor → deps.get_current_user() → decodifica JWT → devuelve User │
# │                                                                         │
# │  RECUPERACIÓN:                                                          │
# │    Cliente → POST /auth/forgot-password {email}                        │
# │    Servidor → guarda OTP "1234" (10 min) → imprime en consola          │
# │    Cliente → POST /auth/reset-password {email, token, new_password}    │
# │    Servidor → valida OTP + expiración → guarda nuevo hash → limpia OTP │
# └─────────────────────────────────────────────────────────────────────────┘
# =============================================================================
