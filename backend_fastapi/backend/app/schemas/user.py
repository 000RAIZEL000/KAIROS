# =============================================================================
# SCHEMA DE USUARIO — DTO de salida para los endpoints de /users
# =============================================================================
# Define la estructura de los datos del usuario que se exponen al cliente.
# Se usa como response_model en GET /users/me para serializar el objeto User
# de SQLAlchemy a JSON, filtrando campos sensibles automáticamente.
# =============================================================================

from pydantic import BaseModel, EmailStr


# -----------------------------------------------------------------------------
# UserPublic — Representación pública y segura del usuario
# -----------------------------------------------------------------------------
# Esta clase define exactamente QUÉ campos del modelo User se envían al cliente.
# Al usarla como response_model, FastAPI garantiza que:
#   - Solo se serialicen los campos definidos aquí
#   - password_hash, otp_code y otp_expiration NUNCA lleguen al cliente
class UserPublic(BaseModel):
    id: int                      # Identificador único del usuario en la BD
    nombre: str                  # Nombre completo del usuario
    email: EmailStr              # Email único usado para el login
    telefono: str | None = None  # Teléfono opcional (puede ser None)
    role: str                    # Rol: "admin" (gestión total) | "user" (lectura)
    activo: bool                 # False si la cuenta está bloqueada por el admin

    class Config:
        # Permite inicializar este schema desde un objeto ORM de SQLAlchemy
        # (el objeto User de app/models/user.py) en lugar de solo desde un dict.
        # Equivalente a orm_mode=True en Pydantic v1.
        from_attributes = True


# Alias usado en algunos endpoints como response_model=UserResponse
# Apunta al mismo schema para mantener consistencia entre módulos
UserResponse = UserPublic


# =============================================================================
# RESUMEN
# =============================================================================
# UserPublic / UserResponse se usa en:
#   - GET /users/me  → devuelve el perfil del usuario autenticado
#
# Campos excluidos intencionalmente (nunca deben salir al cliente):
#   - password_hash    → hash bcrypt de la contraseña
#   - otp_code         → código de recuperación activo
#   - otp_expiration   → fecha de expiración del OTP
#   - created_at       → metadato interno de auditoría
#   - updated_at       → metadato interno de auditoría
#
# from_attributes=True permite que FastAPI llame a UserPublic(id=user.id, ...)
# directamente desde el objeto ORM, sin necesidad de convertir manualmente a dict.
# =============================================================================
