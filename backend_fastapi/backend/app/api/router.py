from fastapi import APIRouter

from app.api.routes import (
    auth,
    equipos,
    eventos,
    jugadores,
    partidos,
    stats,
    torneos,
    users,
)

router = APIRouter()
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(users.router, prefix="/users", tags=["users"])
router.include_router(torneos.router, prefix="/torneos", tags=["torneos"])
router.include_router(equipos.router, prefix="/equipos", tags=["equipos"])
router.include_router(jugadores.router, prefix="/jugadores", tags=["jugadores"])
router.include_router(partidos.router, prefix="/partidos", tags=["partidos"])
router.include_router(eventos.router, prefix="/eventos", tags=["eventos"])
router.include_router(stats.router, prefix="/stats", tags=["stats"])
