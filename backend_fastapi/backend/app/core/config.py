# =============================================================================
# CONFIGURACIÓN GLOBAL DE LA APLICACIÓN — Settings
# =============================================================================
# Centraliza todas las variables de configuración de Kairos API usando
# pydantic-settings, que carga automáticamente desde:
#   1. Variables de entorno del sistema operativo
#   2. El archivo .env en la raíz del proyecto (si existe)
#   3. Los valores por defecto definidos aquí (fallback de desarrollo)
#
# Para producción (Render/Railway) se configuran estas variables directamente
# en el panel de entorno del servidor, sin necesidad del archivo .env.
# =============================================================================

import os
from pydantic_settings import BaseSettings


# -----------------------------------------------------------------------------
# Settings — Clase principal de configuración
# -----------------------------------------------------------------------------
# BaseSettings de pydantic-settings lee cada campo intentando:
#   1. Leer la variable de entorno con el mismo nombre (ej: SECRET_KEY)
#   2. Leer del archivo .env
#   3. Usar el valor por defecto definido aquí
class Settings(BaseSettings):
    # ── Configuración general de la aplicación ─────────────────────────────
    APP_NAME: str = "Kairos API"       # Nombre mostrado en la documentación Swagger
    APP_ENV: str = "development"       # Entorno: "development" | "production"
    DEBUG: bool = True                 # True → muestra errores detallados en respuestas

    # ── Base de datos ───────────────────────────────────────────────────────
    # En desarrollo usa SQLite local; en producción se pasa la URL de PostgreSQL
    # Ejemplo producción: "postgresql://user:pass@host:5432/kairos_db"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./kairos_ag.db")

    # ── Seguridad JWT ───────────────────────────────────────────────────────
    # Clave secreta para firmar los tokens JWT con HMAC-SHA256.
    # En producción DEBE ser una clave aleatoria larga y secreta.
    # NUNCA commitear una clave real al repositorio.
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", "kairos_ag_secret_key_super_segura_cambiar"
    )

    # Algoritmo de firma del JWT. HS256 (HMAC + SHA-256) es simétrico:
    # la misma clave firma y verifica. RS256 sería asimétrico (pub/priv key).
    ALGORITHM: str = "HS256"

    # Tiempo de vida del access_token en minutos.
    # 60 * 24 * 7 = 10080 minutos = 7 días.
    # Tokens de larga duración reducen re-logins pero aumentan el riesgo si
    # son robados. Para mayor seguridad, implementar refresh tokens.
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 días

    class Config:
        env_file = ".env"    # Nombre del archivo de variables de entorno a cargar
        extra = "ignore"     # Ignora variables de entorno que no estén declaradas aquí


# Instancia singleton: toda la app importa este objeto para leer configuración
settings = Settings()

# ── Compatibilidad con imports directos ─────────────────────────────────────
# Permite que módulos importen las variables directamente sin pasar por settings:
#   from app.core.config import SECRET_KEY  (en lugar de settings.SECRET_KEY)
# Mantiene retrocompatibilidad con código existente.
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
DATABASE_URL = settings.DATABASE_URL


# =============================================================================
# RESUMEN DE LA CONFIGURACIÓN JWT
# =============================================================================
# SECRET_KEY:
#   - Usada en security.py → jwt.encode() para FIRMAR tokens
#   - Usada en security.py → jwt.decode() para VERIFICAR tokens
#   - Si se cambia en producción → TODOS los tokens existentes se invalidan
#
# ALGORITHM = "HS256":
#   - HMAC-SHA256: algorítmo simétrico (misma clave para firmar y verificar)
#   - Alternativa segura pero más compleja: RS256 (par público/privado)
#
# ACCESS_TOKEN_EXPIRE_MINUTES = 10080 (7 días):
#   - El campo "exp" en el payload JWT se calcula como now() + este valor
#   - Después de expirar, decode_access_token() devuelve None → HTTP 401
#   - Para implementar refresh tokens, crear un token de corta duración (30 min)
#     y un refresh token de larga duración separado
# =============================================================================
