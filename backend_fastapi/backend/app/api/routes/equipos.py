from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.equipo import Equipo
from app.models.torneo import Torneo
from app.models.user import User
from app.schemas.equipo import EquipoCreate, EquipoResponse, EquipoUpdate

router = APIRouter()


@router.get("/", response_model=list[EquipoResponse])
def list_equipos(torneo_id: int | None = None, db: Session = Depends(get_db)):
    stmt = select(Equipo).order_by(Equipo.nombre.asc())
    if torneo_id is not None:
        stmt = stmt.where(Equipo.torneo_id == torneo_id)
    return db.scalars(stmt).all()


@router.post("/", response_model=EquipoResponse, status_code=status.HTTP_201_CREATED)
def create_equipo(
    payload: EquipoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    torneo = db.get(Torneo, payload.torneo_id)
    if not torneo:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")

    equipo = Equipo(**payload.model_dump())
    db.add(equipo)
    db.commit()
    db.refresh(equipo)
    return equipo


@router.get("/{equipo_id}", response_model=EquipoResponse)
def get_equipo(equipo_id: int, db: Session = Depends(get_db)):
    equipo = db.get(Equipo, equipo_id)
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    return equipo


@router.put("/{equipo_id}", response_model=EquipoResponse)
def update_equipo(
    equipo_id: int,
    payload: EquipoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    equipo = db.get(Equipo, equipo_id)
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(equipo, key, value)

    db.commit()
    db.refresh(equipo)
    return equipo


@router.delete("/{equipo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_equipo(
    equipo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    equipo = db.get(Equipo, equipo_id)
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    db.delete(equipo)
    db.commit()