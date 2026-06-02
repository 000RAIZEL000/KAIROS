# =============================================================================
# MÓDULO DE SEGURIDAD — Hashing de contraseñas y manejo de JWT
# =============================================================================
# Este módulo centraliza todas las operaciones criptográficas del sistema:
#
#   1. Hashing de contraseñas con bcrypt (via passlib)
#   2. Creación de tokens JWT firmados con HS256 (via python-jose)
#   3. Decodificación y verificación de tokens JWT
#
# Es usado por:
#   - app/api/routes/auth.py  → hashear/verificar contraseñas, crear tokens
#   - app/api/deps.py         → decodificar tokens para proteger endpoints
# =============================================================================

from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings


# -----------------------------------------------------------------------------
# Contexto de hashing de contraseñas
# -----------------------------------------------------------------------------
# CryptContext de passlib maneja el ciclo de vida del hashing:
#   - schemes=["bcrypt"] → usa el algoritmo bcrypt (resistente a fuerza bruta)
#   - deprecated="auto"  → rehashea automáticamente contraseñas con esquemas viejos
# Este objeto es el que realmente hashea y verifica contraseñas.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# -----------------------------------------------------------------------------
# verify_password — Verifica si una contraseña en texto plano coincide con su hash
# -----------------------------------------------------------------------------
# Uso: al hacer login, se llama verify_password(password_del_form, user.password_hash)
# bcrypt compara de forma segura sin revelar el hash original.
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# -----------------------------------------------------------------------------
# get_password_hash — Genera el hash bcrypt de una contraseña
# -----------------------------------------------------------------------------
# Uso: al registrar o cambiar contraseña, se llama get_password_hash(nueva_pass)
# y el resultado se guarda en el campo password_hash del modelo User.
# NUNCA se guarda la contraseña en texto plano.
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


# -----------------------------------------------------------------------------
# create_access_token — Crea un JWT firmado con los datos del usuario
# -----------------------------------------------------------------------------
# El token JWT contiene:
#   - Los datos del payload pasado (generalmente {sub, email, type})
#   - Un campo "exp" (expiration) calculado a partir de ahora
#
# Firma el token con settings.SECRET_KEY usando el algoritmo HS256.
# El cliente debe enviar este token en: Authorization: Bearer <token>
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()  # Evitar mutar el dict original

    if expires_delta:
        # Si se pasa un timedelta explícito, usarlo (útil para tokens de vida corta)
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        # Por defecto usa ACCESS_TOKEN_EXPIRE_MINUTES de config (7 días = 10080 min)
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    # Agregar la fecha de expiración al payload antes de firmar
    to_encode.update({"exp": expire})

    # Firmar y codificar el JWT con la clave secreta y algoritmo HS256
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


# -----------------------------------------------------------------------------
# decode_access_token — Decodifica y verifica un JWT
# -----------------------------------------------------------------------------
# Verifica:
#   1. Que la firma sea válida (no fue manipulado el token)
#   2. Que el token no haya expirado (campo "exp")
#
# Retorna:
#   - El payload (dict) si el token es válido
#   - None si el token es inválido, fue manipulado o expiró
#
# Uso: llamado desde get_current_user() en app/api/deps.py para cada request
# a un endpoint protegido.
def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        # JWTError cubre: firma inválida, token expirado, formato incorrecto
        return None


# =============================================================================
# RESUMEN DEL FLUJO CRIPTOGRÁFICO
# =============================================================================
# REGISTRO / CAMBIO DE CONTRASEÑA:
#   texto_plano → get_password_hash() → hash_bcrypt → guardado en BD
#
# LOGIN:
#   texto_plano + hash_BD → verify_password() → True/False
#
# EMISIÓN DE TOKEN (login/registro exitoso):
#   {sub, email, type} + exp → create_access_token() → JWT firmado (string)
#   El JWT viaja en el response JSON como "access_token"
#
# VALIDACIÓN DE TOKEN (cada request protegido):
#   JWT del header → decode_access_token() → payload o None
#   Si None → HTTP 401 Unauthorized
#   Si payload → get_current_user() busca el usuario en BD por payload["sub"]
#
# ESTRUCTURA DEL JWT:
#   Header: {"alg": "HS256", "typ": "JWT"}
#   Payload: {"sub": "123", "email": "user@mail.com", "type": "access", "exp": ...}
#   Signature: HMAC-SHA256(base64(header) + "." + base64(payload), SECRET_KEY)
# =============================================================================
