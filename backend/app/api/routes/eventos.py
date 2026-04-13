from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.equipo import Equipo
from app.models.evento_partido import EventoPartido
from app.models.jugador import Jugador
from app.models.partido import Partido
from app.models.user import User
from app.schemas.evento import EventoCreate, EventoResponse

router = APIRouter()


@router.get("/", response_model=list[EventoResponse])
def list_eventos(partido_id: int | None = None, db: Session = Depends(get_db)):
    stmt = select(EventoPartido).order_by(EventoPartido.id.asc())

    if partido_id is not None:
        stmt = stmt.where(EventoPartido.partido_id == partido_id)

    return db.scalars(stmt).all()


@router.post("/", response_model=EventoResponse, status_code=status.HTTP_201_CREATED)
def create_evento(
    payload: EventoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    partido = db.get(Partido, payload.partido_id)
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado")

    if payload.minuto is not None and payload.minuto < 0:
        raise HTTPException(status_code=400, detail="El minuto no puede ser negativo")

    if payload.valor is not None and payload.valor < 0:
        raise HTTPException(status_code=400, detail="El valor no puede ser negativo")

    tipos_validos = {"gol", "amarilla", "roja", "asistencia"}
    if payload.tipo_evento not in tipos_validos:
        raise HTTPException(
            status_code=400,
            detail=f"tipo_evento inválido. Usa uno de: {', '.join(sorted(tipos_validos))}",
        )

    jugador = None
    if payload.jugador_id is not None:
        jugador = db.get(Jugador, payload.jugador_id)
        if not jugador:
            raise HTTPException(status_code=404, detail="Jugador no encontrado")

    equipo = None
    if payload.equipo_id is not None:
        equipo = db.get(Equipo, payload.equipo_id)
        if not equipo:
            raise HTTPException(status_code=404, detail="Equipo no encontrado")

    equipos_del_partido = {partido.equipo_local_id, partido.equipo_visitante_id}

    if equipo and equipo.id not in equipos_del_partido:
        raise HTTPException(
            status_code=400,
            detail="El equipo no pertenece a este partido",
        )

    if jugador:
        if jugador.equipo_id not in equipos_del_partido:
            raise HTTPException(
                status_code=400,
                detail="El jugador no pertenece a ninguno de los equipos del partido",
            )

        if payload.equipo_id is not None and jugador.equipo_id != payload.equipo_id:
            raise HTTPException(
                status_code=400,
                detail="El jugador no pertenece al equipo enviado",
            )

    evento = EventoPartido(**payload.model_dump())
    db.add(evento)
    db.commit()
    db.refresh(evento)
    return evento


@router.put("/{evento_id}", response_model=EventoResponse)
def update_evento(
    evento_id: int,
    payload: EventoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    evento = db.get(EventoPartido, evento_id)
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    partido = db.get(Partido, payload.partido_id)
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado")

    if payload.minuto is not None and payload.minuto < 0:
        raise HTTPException(status_code=400, detail="El minuto no puede ser negativo")

    if payload.valor is not None and payload.valor < 0:
        raise HTTPException(status_code=400, detail="El valor no puede ser negativo")

    tipos_validos = {"gol", "amarilla", "roja", "asistencia"}
    if payload.tipo_evento not in tipos_validos:
        raise HTTPException(
            status_code=400,
            detail=f"tipo_evento inválido. Usa uno de: {', '.join(sorted(tipos_validos))}",
        )

    jugador = None
    if payload.jugador_id is not None:
        jugador = db.get(Jugador, payload.jugador_id)
        if not jugador:
            raise HTTPException(status_code=404, detail="Jugador no encontrado")

    equipo = None
    if payload.equipo_id is not None:
        equipo = db.get(Equipo, payload.equipo_id)
        if not equipo:
            raise HTTPException(status_code=404, detail="Equipo no encontrado")

    equipos_del_partido = {partido.equipo_local_id, partido.equipo_visitante_id}

    if equipo and equipo.id not in equipos_del_partido:
        raise HTTPException(status_code=400, detail="El equipo no pertenece a este partido")

    if jugador:
        if jugador.equipo_id not in equipos_del_partido:
            raise HTTPException(
                status_code=400,
                detail="El jugador no pertenece a ninguno de los equipos del partido",
            )

        if payload.equipo_id is not None and jugador.equipo_id != payload.equipo_id:
            raise HTTPException(
                status_code=400,
                detail="El jugador no pertenece al equipo enviado",
            )

    for key, value in payload.model_dump().items():
        setattr(evento, key, value)

    db.commit()
    db.refresh(evento)
    return evento


@router.delete("/{evento_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_evento(
    evento_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    evento = db.get(EventoPartido, evento_id)
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    db.delete(evento)
    db.commit()