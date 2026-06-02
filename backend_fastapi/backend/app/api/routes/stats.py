from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.stats import GoleadorRow, ResumenTorneo, TablaRow, TarjetaRow
from app.services.stats_service import goleadores, resumen_torneo, tarjetas
from app.services.tabla_service import build_table

router = APIRouter()


@router.get("/tabla/{torneo_id}", response_model=list[TablaRow])
def tabla(torneo_id: int, db: Session = Depends(get_db)):
    return build_table(db, torneo_id)


@router.get("/goleadores/{torneo_id}", response_model=list[GoleadorRow])
def goleadores_by_torneo(torneo_id: int, db: Session = Depends(get_db)):
    return goleadores(db, torneo_id)


@router.get("/tarjetas/{torneo_id}", response_model=list[TarjetaRow])
def tarjetas_by_torneo(torneo_id: int, db: Session = Depends(get_db)):
    return tarjetas(db, torneo_id)


@router.get("/resumen/{torneo_id}", response_model=ResumenTorneo)
def resumen(torneo_id: int, db: Session = Depends(get_db)):
    return resumen_torneo(db, torneo_id)