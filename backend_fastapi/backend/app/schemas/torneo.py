from datetime import date

from pydantic import BaseModel, Field

from app.schemas.common import TimestampSchema


class TorneoBase(BaseModel):
    nombre: str = Field(min_length=2, max_length=120)
    deporte: str = Field(min_length=2, max_length=50)
    modalidad: str = Field(min_length=2, max_length=50)
    descripcion: str | None = None
    direccion: str | None = None
    fecha_inicio: date | None = None
    fecha_fin: date | None = None
    estado: str = "Pendiente"
    imagen_url: str | None = None


class TorneoCreate(TorneoBase):
    pass


class TorneoUpdate(BaseModel):
    nombre: str | None = None
    deporte: str | None = None
    modalidad: str | None = None
    descripcion: str | None = None
    direccion: str | None = None
    fecha_inicio: date | None = None
    fecha_fin: date | None = None
    estado: str | None = None
    imagen_url: str | None = None


class TorneoResponse(TorneoBase, TimestampSchema):
    id: int
    user_id: int | None = None