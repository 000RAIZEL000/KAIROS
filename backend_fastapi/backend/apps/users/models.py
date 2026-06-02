# =============================================================================
# MODELO DE USUARIO - Django (legacy / referencia)
# =============================================================================
# Este archivo es el modelo original de Django usado como prototipo antes de
# migrar el backend a FastAPI + SQLAlchemy. Actualmente NO está activo en
# producción, pero sirve como referencia de la estructura de datos del usuario.
#
# El modelo activo en FastAPI está en: app/models/user.py
# =============================================================================

from django.db import models
from django.contrib.auth.models import AbstractUser


# -----------------------------------------------------------------------------
# TimestampedModel — Mixin abstracto de auditoría
# -----------------------------------------------------------------------------
# Proporciona las columnas created_at y updated_at a cualquier modelo que lo
# herede. Al ser "abstract = True" Django no crea una tabla propia para él.
class TimestampedModel(models.Model):
    # Fecha de creación: se establece automáticamente al crear el registro
    created_at = models.DateTimeField(auto_now_add=True)
    # Fecha de última modificación: se actualiza automáticamente en cada save()
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True  # No genera tabla en la base de datos


# -----------------------------------------------------------------------------
# User — Modelo principal de usuario
# -----------------------------------------------------------------------------
# Extiende AbstractUser de Django (que ya incluye username, password, is_active,
# is_staff, etc.) y añade los campos propios de Kairos.
# Hereda también de TimestampedModel para las fechas de auditoría.
class User(AbstractUser, TimestampedModel):
    # Nombre completo del usuario (campo obligatorio en Kairos)
    nombre = models.CharField(max_length=255)

    # Email único: se usa como identificador principal de autenticación
    email = models.EmailField(unique=True)

    # Teléfono opcional — se usa para enviar el OTP de recuperación de contraseña
    telefono = models.CharField(max_length=20, blank=True, null=True)

    # Rol del usuario dentro del sistema:
    #   "admin" → puede gestionar torneos, equipos y usuarios
    #   "user"  → solo puede ver/participar
    role = models.CharField(max_length=20, default="user")  # admin | user

    # Indica si el usuario puede iniciar sesión. Si es False, el login falla con 403
    activo = models.BooleanField(default=True)

    # Código OTP generado para recuperar contraseña (actualmente valor estático "1234" en dev)
    otp_code = models.CharField(max_length=10, blank=True, null=True)

    # Fecha/hora límite de validez del OTP (expira a los 10 minutos)
    otp_expiration = models.DateTimeField(blank=True, null=True)

    # Campo username heredado de AbstractUser — mantenido por compatibilidad pero
    # no se usa para login (se usa email en su lugar)
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)

    # Le indica a Django que el campo de autenticación principal es el email
    USERNAME_FIELD = 'email'

    # Campos adicionales requeridos al crear usuario con createsuperuser
    REQUIRED_FIELDS = ['nombre']

    def __str__(self):
        # Representación legible del usuario en el panel de Django admin
        return self.email


# =============================================================================
# RESUMEN DEL FLUJO (modelo Django legacy)
# =============================================================================
# 1. El usuario se registra con email + contraseña → se almacena con role="user"
# 2. Django maneja el hash de contraseña internamente (no se almacena en texto plano)
# 3. El campo USERNAME_FIELD='email' hace que Django use email para autenticarse
# 4. Si el usuario olvida su contraseña:
#    a. Se genera un otp_code y se guarda con otp_expiration (+10 min)
#    b. Se envía el OTP (actualmente se imprime en consola en modo dev)
#    c. El usuario envía email + otp + new_password → se actualiza el hash
# 5. El campo "activo" bloquea el login si está en False
# 6. NOTA: Este modelo NO está conectado a la API activa (FastAPI).
#    Ver app/models/user.py y app/api/routes/auth.py para el flujo en producción.
# =============================================================================
