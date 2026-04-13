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

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(torneos.router, prefix="/torneos", tags=["torneos"])
api_router.include_router(equipos.router, prefix="/equipos", tags=["equipos"])
api_router.include_router(jugadores.router, prefix="/jugadores", tags=["jugadores"])
api_router.include_router(partidos.router, prefix="/partidos", tags=["partidos"])
api_router.include_router(eventos.router, prefix="/eventos", tags=["eventos"])
api_router.include_router(stats.router, prefix="/stats", tags=["stats"])