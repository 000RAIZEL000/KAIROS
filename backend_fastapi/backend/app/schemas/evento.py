from pydantic import BaseModel, Field

from app.schemas.common import TimestampSchema


class EventoCreate(BaseModel):
    partido_id: int
    jugador_id: int | None = None
    equipo_id: int | None = None
    tipo_evento: str = Field(min_length=2, max_length=30)
    minuto: int | None = None
    valor: int | None = None
    descripcion: str | None = None


class EventoResponse(EventoCreate, TimestampSchema):
    id: int