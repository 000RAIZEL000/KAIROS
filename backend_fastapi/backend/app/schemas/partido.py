from datetime import datetime

from pydantic import BaseModel

from app.schemas.common import TimestampSchema


class PartidoBase(BaseModel):
    torneo_id: int
    equipo_local_id: int
    equipo_visitante_id: int
    fecha: datetime | None = None
    cancha: str | None = None
    jornada: int | None = None
    fase: str | None = None
    goles_local: int = 0
    goles_visitante: int = 0
    estado: str = "Pendiente"
    arbitro: str | None = None
    observaciones: str | None = None


class PartidoCreate(PartidoBase):
    pass


class PartidoUpdate(BaseModel):
    fecha: datetime | None = None
    cancha: str | None = None
    jornada: int | None = None
    fase: str | None = None
    goles_local: int | None = None
    goles_visitante: int | None = None
    estado: str | None = None
    arbitro: str | None = None
    observaciones: str | None = None


class PartidoResponse(PartidoBase, TimestampSchema):
    id: int