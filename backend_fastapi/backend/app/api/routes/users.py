# =============================================================================
# RUTAS DE USUARIO — /users
# =============================================================================
# Este archivo define los endpoints del recurso "usuario" que requieren
# que el cliente esté autenticado (tienen un token JWT válido).
#
#   GET /users/me  → Devuelve el perfil del usuario autenticado actual
#
# El router se registra en app/api/router.py con prefix="/users".
# Todos los endpoints aquí son PRIVADOS: requieren un JWT válido.
# =============================================================================

from fastapi import APIRouter, Depends

# Dependencia que extrae y valida el usuario del token JWT entrante
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter()


# =============================================================================
# ENDPOINT: Perfil del usuario autenticado
# =============================================================================
@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Devuelve los datos del usuario que está haciendo la solicitud.

    Flujo:
    1. FastAPI ejecuta get_current_user() antes de llamar a esta función
    2. get_current_user() lee el header Authorization: Bearer <token>
    3. Decodifica el JWT y busca el usuario en la BD
    4. Si el token es inválido o el usuario está inactivo → HTTP 401
    5. Si todo es válido → devuelve el objeto User serializado como UserResponse

    El cliente debe enviar: Authorization: Bearer <access_token>
    """
    # El objeto current_user ya fue validado por get_current_user()
    # FastAPI lo serializa automáticamente usando el schema UserResponse
    return current_user


# =============================================================================
# RESUMEN DEL FLUJO DE ACCESO PROTEGIDO
# =============================================================================
# 1. El usuario se autentica via POST /auth/login y recibe un access_token JWT
# 2. Para cada solicitud protegida incluye: Authorization: Bearer <token>
# 3. HTTPBearer en deps.py extrae el token del header
# 4. decode_access_token() verifica la firma con SECRET_KEY y el algoritmo HS256
# 5. Se extrae el "sub" (ID del usuario) del payload del JWT
# 6. Se consulta la BD: el usuario debe existir y tener activo=True
# 7. El objeto User se inyecta en el endpoint mediante Depends(get_current_user)
#
# Schema de respuesta: UserResponse (ver app/schemas/user.py)
#   → Expone: id, nombre, email, telefono, role, activo
#   → NO expone: password_hash, otp_code, otp_expiration (datos sensibles)
# =============================================================================
