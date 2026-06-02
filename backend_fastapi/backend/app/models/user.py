# =============================================================================
# MODELO DE USUARIO — SQLAlchemy / FastAPI (modelo activo en producción)
# =============================================================================
# Define la tabla "users" en la base de datos mediante SQLAlchemy ORM.
# Es el modelo central del sistema de autenticación de Kairos.
#
# Relaciones:
#   - Un usuario puede crear/poseer múltiples torneos (one-to-many con Torneo)
# =============================================================================

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin


# -----------------------------------------------------------------------------
# User — Tabla "users" en la base de datos
# -----------------------------------------------------------------------------
# Hereda de:
#   Base        → clase declarativa de SQLAlchemy (necesaria para mapear la tabla)
#   TimestampMixin → añade created_at y updated_at automáticamente (ver base.py)
class User(Base, TimestampMixin):
    __tablename__ = "users"  # Nombre real de la tabla en PostgreSQL/SQLite

    # Clave primaria autoincremental con índice para búsquedas rápidas por ID
    id = Column(Integer, primary_key=True, index=True)

    # Nombre completo del usuario — obligatorio (nullable=False)
    nombre = Column(String, nullable=False)

    # Email del usuario — único en toda la tabla e indexado para login rápido
    # Se usa como identificador principal en el JWT (campo "email" del payload)
    email = Column(String, unique=True, index=True, nullable=False)

    # Número de teléfono — opcional, reservado para futura integración de SMS/OTP
    telefono = Column(String, nullable=True)  # Necesario para SMS

    # Hash de la contraseña generado con bcrypt (nunca se guarda en texto plano)
    # La función get_password_hash() de security.py es la que produce este valor
    password_hash = Column(String, nullable=False)

    # Rol del usuario dentro del sistema:
    #   "admin" → puede crear torneos, gestionar todo
    #   "user"  → acceso de solo lectura / participante
    # La dependencia require_admin() en deps.py verifica este campo
    role = Column(String, nullable=False, default="user")  # admin | user

    # Indica si el usuario puede autenticarse:
    #   True  → acceso permitido
    #   False → get_current_user() rechaza la sesión con HTTP 401
    activo = Column(Boolean, nullable=False, default=True)

    # Código OTP para recuperación de contraseña (actualmente "1234" en modo dev)
    # Se genera en POST /auth/forgot-password y se valida en POST /auth/reset-password
    otp_code = Column(String, nullable=True)

    # Fecha y hora de expiración del OTP (+10 minutos desde su generación)
    # Si datetime.now(utc) > otp_expiration → código rechazado con HTTP 400
    otp_expiration = Column(DateTime, nullable=True)

    # Relación uno-a-muchos: un usuario puede poseer varios torneos.
    # cascade="all, delete-orphan" → al borrar el usuario se borran sus torneos.
    torneos = relationship("Torneo", back_populates="usuario", cascade="all, delete-orphan")


# =============================================================================
# RESUMEN DEL FLUJO DE AUTENTICACIÓN (modelo SQLAlchemy)
# =============================================================================
# 1. REGISTRO (POST /auth/register):
#    - Se recibe nombre, email, password, telefono
#    - Se hashea la contraseña con bcrypt → se guarda en password_hash
#    - Si el email es "admin@admin.com", role="admin"; si no, role="user"
#    - Se devuelve un access_token JWT con {sub: user.id, email, type:"access"}
#
# 2. LOGIN (POST /auth/login):
#    - Se busca el usuario por email → verify_password() compara el hash
#    - Si activo=False → HTTP 403 (usuario bloqueado)
#    - Se devuelve un access_token JWT igual que en el registro
#
# 3. ACCESO PROTEGIDO (cualquier endpoint con Depends(get_current_user)):
#    - El cliente envía el token en el header: Authorization: Bearer <token>
#    - decode_access_token() verifica la firma y la expiración del JWT
#    - Se busca el usuario por el "sub" del payload (ID o email por compatibilidad)
#    - Si activo=False o no existe → HTTP 401
#
# 4. RECUPERACIÓN DE CONTRASEÑA:
#    - POST /auth/forgot-password → genera otp_code="1234" por 10 minutos
#    - POST /auth/reset-password  → valida otp_code + expiración → actualiza hash
# =============================================================================
