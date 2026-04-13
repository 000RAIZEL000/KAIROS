from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.torneo import Torneo
from app.models.user import User
from app.schemas.torneo import TorneoCreate, TorneoResponse, TorneoUpdate

router = APIRouter()


@router.get("/", response_model=list[TorneoResponse])
def list_torneos(db: Session = Depends(get_db)):
    return db.scalars(select(Torneo).order_by(Torneo.id.desc())).all()


@router.post("/", response_model=TorneoResponse, status_code=status.HTTP_201_CREATED)
def create_torneo(
    payload: TorneoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    torneo = Torneo(**payload.model_dump(), user_id=current_user.id)
    db.add(torneo)
    db.commit()
    db.refresh(torneo)
    return torneo


@router.get("/{torneo_id}", response_model=TorneoResponse)
def get_torneo(torneo_id: int, db: Session = Depends(get_db)):
    torneo = db.get(Torneo, torneo_id)
    if not torneo:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")
    return torneo


@router.put("/{torneo_id}", response_model=TorneoResponse)
def update_torneo(
    torneo_id: int,
    payload: TorneoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    torneo = db.get(Torneo, torneo_id)
    if not torneo:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(torneo, key, value)

    db.commit()
    db.refresh(torneo)
    return torneo


@router.delete("/{torneo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_torneo(
    torneo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    torneo = db.get(Torneo, torneo_id)
    if not torneo:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")

    db.delete(torneo)
    db.commit()