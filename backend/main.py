from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.session import engine
from app.models import Base
from app.api.routes.auth import router as auth_router
from app.api.routes.torneos import router as torneos_router
from app.api.routes.equipos import router as equipos_router
from app.api.routes.jugadores import router as jugadores_router
from app.api.routes.partidos import router as partidos_router
from app.api.routes.eventos import router as eventos_router
from app.api.routes.stats import router as stats_router

app = FastAPI(title="Kairos AG API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router, prefix="/api")
app.include_router(torneos_router, prefix="/api/torneos", tags=["torneos"])
app.include_router(equipos_router, prefix="/api/equipos", tags=["equipos"])
app.include_router(jugadores_router, prefix="/api/jugadores", tags=["jugadores"])
app.include_router(partidos_router, prefix="/api/partidos", tags=["partidos"])
app.include_router(eventos_router, prefix="/api/eventos", tags=["eventos"])
app.include_router(stats_router, prefix="/api/stats", tags=["stats"])


@app.get("/")
def root():
    return {"message": "Kairos AG API funcionando"}

