from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.equipo import Equipo
from app.models.partido import Partido
from app.models.torneo import Torneo
from app.models.user import User
from app.schemas.partido import PartidoCreate, PartidoResponse, PartidoUpdate

router = APIRouter()


@router.get("/", response_model=list[PartidoResponse])
def list_partidos(torneo_id: int | None = None, db: Session = Depends(get_db)):
    stmt = select(Partido).order_by(Partido.fecha.asc())
    if torneo_id is not None:
        stmt = stmt.where(Partido.torneo_id == torneo_id)
    return db.scalars(stmt).all()


@router.post("/", response_model=PartidoResponse, status_code=status.HTTP_201_CREATED)
def create_partido(
    payload: PartidoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    torneo = db.get(Torneo, payload.torneo_id)
    if not torneo:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")

    if payload.equipo_local_id == payload.equipo_visitante_id:
        raise HTTPException(
            status_code=400,
            detail="Un equipo no puede jugar contra sí mismo",
        )

    equipo_local = db.get(Equipo, payload.equipo_local_id)
    equipo_visitante = db.get(Equipo, payload.equipo_visitante_id)

    if not equipo_local:
        raise HTTPException(status_code=404, detail="Equipo local no encontrado")

    if not equipo_visitante:
        raise HTTPException(status_code=404, detail="Equipo visitante no encontrado")

    if equipo_local.torneo_id != payload.torneo_id:
        raise HTTPException(
            status_code=400,
            detail="El equipo local no pertenece al torneo",
        )

    if equipo_visitante.torneo_id != payload.torneo_id:
        raise HTTPException(
            status_code=400,
            detail="El equipo visitante no pertenece al torneo",
        )

    if payload.goles_local < 0 or payload.goles_visitante < 0:
        raise HTTPException(
            status_code=400,
            detail="Los goles no pueden ser negativos",
        )

    estados_validos = {"Pendiente", "En juego", "Finalizado", "Suspendido"}
    if payload.estado not in estados_validos:
        raise HTTPException(
            status_code=400,
            detail=f"Estado inválido. Usa uno de: {', '.join(sorted(estados_validos))}",
        )

    partido = Partido(**payload.model_dump())
    db.add(partido)
    db.commit()
    db.refresh(partido)
    return partido


@router.get("/{partido_id}", response_model=PartidoResponse)
def get_partido(partido_id: int, db: Session = Depends(get_db)):
    partido = db.get(Partido, partido_id)
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
    return partido


@router.put("/{partido_id}", response_model=PartidoResponse)
def update_partido(
    partido_id: int,
    payload: PartidoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    partido = db.get(Partido, partido_id)
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado")

    data = payload.model_dump(exclude_unset=True)

    if "goles_local" in data and data["goles_local"] is not None and data["goles_local"] < 0:
        raise HTTPException(status_code=400, detail="Los goles del local no pueden ser negativos")

    if "goles_visitante" in data and data["goles_visitante"] is not None and data["goles_visitante"] < 0:
        raise HTTPException(status_code=400, detail="Los goles del visitante no pueden ser negativos")

    if "estado" in data:
        estados_validos = {"Pendiente", "En juego", "Finalizado", "Suspendido"}
        if data["estado"] not in estados_validos:
            raise HTTPException(
                status_code=400,
                detail=f"Estado inválido. Usa uno de: {', '.join(sorted(estados_validos))}",
            )

    for key, value in data.items():
        setattr(partido, key, value)

    db.commit()
    db.refresh(partido)
    return partido


@router.delete("/{partido_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_partido(
    partido_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    partido = db.get(Partido, partido_id)
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado")

    db.delete(partido)
    db.commit()