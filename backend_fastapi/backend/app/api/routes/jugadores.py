from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, require_admin
from app.models.equipo import Equipo
from app.models.jugador import Jugador
from app.models.user import User
from app.schemas.jugador import JugadorCreate, JugadorResponse, JugadorUpdate

router = APIRouter()


@router.get("/", response_model=list[JugadorResponse])
def list_jugadores(equipo_id: int | None = None, db: Session = Depends(get_db)):
    stmt = select(Jugador).order_by(Jugador.nombre.asc(), Jugador.apellido.asc())
    if equipo_id is not None:
        stmt = stmt.where(Jugador.equipo_id == equipo_id)
    return db.scalars(stmt).all()


@router.post("/", response_model=JugadorResponse, status_code=status.HTTP_201_CREATED)
def create_jugador(
    payload: JugadorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    equipo = db.get(Equipo, payload.equipo_id)
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    jugador = Jugador(**payload.model_dump())
    db.add(jugador)
    db.commit()
    db.refresh(jugador)
    return jugador


@router.get("/{jugador_id}", response_model=JugadorResponse)
def get_jugador(jugador_id: int, db: Session = Depends(get_db)):
    jugador = db.get(Jugador, jugador_id)
    if not jugador:
        raise HTTPException(status_code=404, detail="Jugador no encontrado")
    return jugador


@router.put("/{jugador_id}", response_model=JugadorResponse)
def update_jugador(
    jugador_id: int,
    payload: JugadorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    jugador = db.get(Jugador, jugador_id)
    if not jugador:
        raise HTTPException(status_code=404, detail="Jugador no encontrado")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(jugador, key, value)

    db.commit()
    db.refresh(jugador)
    return jugador


@router.delete("/{jugador_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_jugador(
    jugador_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    jugador = db.get(Jugador, jugador_id)
    if not jugador:
        raise HTTPException(status_code=404, detail="Jugador no encontrado")

    db.delete(jugador)
    db.commit()