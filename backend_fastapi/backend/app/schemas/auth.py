# =============================================================================
# SCHEMAS DE AUTENTICACIÓN — DTOs de entrada y salida para /auth
# =============================================================================
# Los schemas de Pydantic cumplen el rol de "serializers" en Django REST:
#   - Validan y parsean el body de las solicitudes HTTP entrantes
#   - Definen la forma de los datos de respuesta (serialización de salida)
#   - Generan automáticamente la documentación en Swagger UI (/docs)
#
# Estos schemas son usados por los endpoints en app/api/routes/auth.py.
# NOTA: Los schemas de uso directo en las rutas están definidos inline en
# auth.py para simplicidad. Este archivo contiene los DTOs alternativos/comunes.
# =============================================================================

from pydantic import BaseModel, EmailStr


# -----------------------------------------------------------------------------
# UserRegister — DTO de entrada para el registro de nuevos usuarios
# -----------------------------------------------------------------------------
# Corresponde al body esperado en POST /auth/register.
# EmailStr de Pydantic valida automáticamente el formato de email.
class UserRegister(BaseModel):
    nombre: str               # Nombre completo del usuario (obligatorio)
    email: EmailStr           # Email único que será el identificador de login
    telefono: str | None = None  # Teléfono opcional para SMS/OTP (puede ser None)
    password: str             # Contraseña en texto plano (se hashea en el endpoint)


# -----------------------------------------------------------------------------
# ForgotPasswordRequest — DTO de entrada para solicitar recuperación por teléfono
# -----------------------------------------------------------------------------
# Versión alternativa del forgot-password usando teléfono como identificador.
# Actualmente las rutas activas usan email en su lugar (ver auth.py inline).
class ForgotPasswordRequest(BaseModel):
    telefono: str  # Número de teléfono del usuario registrado


# -----------------------------------------------------------------------------
# ResetPasswordRequest — DTO de entrada para restablecer contraseña via OTP
# -----------------------------------------------------------------------------
# Versión alternativa del reset-password usando teléfono.
# Las rutas activas usan email + token + new_password (ver auth.py inline).
class ResetPasswordRequest(BaseModel):
    telefono: str      # Identificador del usuario
    otp: str           # Código OTP recibido (actualmente "1234" en dev)
    new_password: str  # Nueva contraseña en texto plano (se hashea en el endpoint)


# -----------------------------------------------------------------------------
# UserLogin — DTO de entrada para el inicio de sesión
# -----------------------------------------------------------------------------
# Body esperado en POST /auth/login.
class UserLogin(BaseModel):
    email: EmailStr  # Email registrado del usuario
    password: str    # Contraseña en texto plano para verificar contra el hash


# -----------------------------------------------------------------------------
# UserOut — DTO de salida con los datos públicos del usuario
# -----------------------------------------------------------------------------
# Representa los datos del usuario que se pueden exponer de forma segura.
# NO incluye campos sensibles como password_hash, otp_code, otp_expiration.
class UserOut(BaseModel):
    id: int          # Identificador único del usuario
    nombre: str      # Nombre completo
    email: EmailStr  # Email (identificador de login)
    role: str        # Rol: "admin" | "user"
    activo: bool     # Estado de la cuenta (False = bloqueado)

    class Config:
        # Permite crear UserOut desde un objeto ORM de SQLAlchemy (User model)
        # en lugar de solo desde un dict. Equivale a orm_mode=True en Pydantic v1.
        from_attributes = True


# -----------------------------------------------------------------------------
# TokenResponse — DTO de salida completa tras login/registro exitoso
# -----------------------------------------------------------------------------
# Estructura de respuesta devuelta por POST /auth/login y POST /auth/register.
# El cliente mobile (Expo) almacena el access_token para enviarlo en futuros requests.
class TokenResponse(BaseModel):
    access_token: str   # JWT firmado con HS256, expira en 7 días (configurable)
    token_type: str     # Siempre "bearer" — define el esquema de autenticación HTTP
    user: UserOut       # Datos públicos del usuario autenticado (sin datos sensibles)


# =============================================================================
# RESUMEN DEL FLUJO DE SERIALIZACIÓN
# =============================================================================
# 1. REQUEST ENTRANTE:
#    - FastAPI lee el body JSON y lo valida contra UserLogin/UserRegister
#    - Si falta un campo requerido o el tipo no coincide → HTTP 422 Unprocessable
#    - EmailStr rechaza automáticamente emails con formato inválido
#
# 2. RESPUESTA SALIENTE:
#    - El endpoint construye un dict con access_token + user
#    - TokenResponse garantiza que solo se exponen campos seguros (UserOut)
#    - from_attributes=True permite convertir el objeto ORM User → UserOut
#
# 3. SEGURIDAD:
#    - password_hash NUNCA aparece en ningún schema de salida
#    - otp_code y otp_expiration tampoco se exponen en respuestas
# =============================================================================
