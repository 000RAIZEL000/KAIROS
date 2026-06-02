# =============================================================================
# DEPENDENCIAS DE LA API — Guards y utilidades compartidas
# =============================================================================
# Este módulo define las dependencias de FastAPI reutilizables en toda la API.
# En FastAPI, las "dependencias" (Depends) funcionan como middleware por endpoint:
# se ejecutan ANTES que el handler del endpoint y pueden inyectar objetos o
# lanzar excepciones HTTP para bloquear el acceso.
#
# Equivalentes en otros frameworks:
#   - Guards en NestJS
#   - Middleware/Permissions en Django REST Framework
#   - Filters en Spring Boot
#
# Contenido:
#   - get_db()           → sesión de base de datos por request
#   - get_current_user() → guard de autenticación JWT
#   - require_admin()    → guard de autorización por rol
# =============================================================================

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import decode_access_token


# -----------------------------------------------------------------------------
# HTTPBearer — Esquema de seguridad que extrae el token del header
# -----------------------------------------------------------------------------
# HTTPBearer espera el header: Authorization: Bearer <token>
# auto_error=False significa que si no hay token, NO lanza error automáticamente,
# sino que pasa credentials=None. El error se maneja manualmente en get_current_user.
security = HTTPBearer(auto_error=False)


# -----------------------------------------------------------------------------
# get_db — Dependencia que provee una sesión de base de datos
# -----------------------------------------------------------------------------
# Patrón "session-per-request": abre una sesión al inicio del request y la
# cierra (con finally) al finalizar, independientemente de si hubo error.
# Se usa con: db: Session = Depends(get_db)
def get_db():
    db = SessionLocal()
    try:
        yield db  # El endpoint recibe este objeto db
    finally:
        db.close()  # Se ejecuta siempre, incluso si hay excepciones


# -----------------------------------------------------------------------------
# get_current_user — Guard de autenticación JWT
# -----------------------------------------------------------------------------
# Verifica que el request tenga un token JWT válido y devuelve el usuario.
# Se usa con: current_user: User = Depends(get_current_user)
#
# Flujo de validación:
#   1. HTTPBearer extrae el token del header Authorization
#   2. decode_access_token() verifica firma y expiración del JWT
#   3. Se extrae el "sub" del payload (puede ser ID numérico o email)
#   4. Se busca el usuario en BD y se verifica que esté activo
#   5. Se devuelve el objeto User al endpoint
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    # Si no viene el header Authorization → credenciales ausentes
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token requerido",
        )

    # Extraer el token del objeto credentials (el valor después de "Bearer ")
    token = credentials.credentials
    payload = decode_access_token(token)

    # Si decode devuelve None → token inválido, manipulado o expirado
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
        )

    # Extraer el "sub" (subject = identificador del usuario) del payload JWT
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido (sin identificador)",
        )

    # El sub puede ser un ID (numero) o un Email (string) por compatibilidad
    # — Tokens nuevos usan ID numérico: {"sub": "123"}
    # — Tokens legacy pueden usar email: {"sub": "user@mail.com"}
    if str(user_id).isdigit():
        user = db.query(User).filter(User.id == int(user_id), User.activo == True).first()
    else:
        user = db.query(User).filter(User.email == str(user_id), User.activo == True).first()

    # Si el usuario no existe o está desactivado (activo=False) → acceso denegado
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado o inactivo",
        )

    return user  # Objeto User inyectado al endpoint


# -----------------------------------------------------------------------------
# require_admin — Guard de autorización por rol
# -----------------------------------------------------------------------------
# Verifica que el usuario autenticado tenga el rol "admin".
# Se usa con: admin: User = Depends(require_admin)
#
# Flujo:
#   1. Primero ejecuta get_current_user() (autenticación)
#   2. Luego verifica que role == "admin" (autorización)
#   3. Si no es admin → HTTP 403 Forbidden
def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el administrador puede realizar esta acción",
        )
    return current_user  # Objeto User admin inyectado al endpoint


# =============================================================================
# RESUMEN DEL FLUJO DE GUARDS (Dependencias de seguridad)
# =============================================================================
# AUTENTICACIÓN (¿Quién eres?):
#   Endpoint usa Depends(get_current_user)
#   → HTTPBearer lee "Authorization: Bearer <token>" del header
#   → decode_access_token() verifica firma HS256 + expiración
#   → Se busca usuario en BD por sub (ID o email)
#   → Si activo=True → inyecta User al endpoint
#   → Si falla cualquier paso → HTTP 401 Unauthorized
#
# AUTORIZACIÓN (¿Qué puedes hacer?):
#   Endpoint usa Depends(require_admin)
#   → Internamente llama get_current_user() (autenticación primero)
#   → Verifica user.role == "admin"
#   → Si no es admin → HTTP 403 Forbidden
#   → Si es admin → inyecta User admin al endpoint
#
# CADENA DE DEPENDENCIAS:
#   require_admin
#     └─ get_current_user
#          ├─ HTTPBearer (extrae token del header)
#          └─ get_db (sesión de BD)
# =============================================================================
