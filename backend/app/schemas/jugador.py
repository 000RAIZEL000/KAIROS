from datetime import date

from pydantic import BaseModel, Field

from app.schemas.common import TimestampSchema


class JugadorBase(BaseModel):
    equipo_id: int
    nombre: str = Field(min_length=2, max_length=80)
    apellido: str = Field(min_length=2, max_length=80)
    dni: str | None = None
    fecha_nacimiento: date | None = None
    posicion: str | None = None
    numero_camiseta: int | None = None
    foto_url: str | None = None
    activo: bool = True


class JugadorCreate(JugadorBase):
    pass


class JugadorUpdate(BaseModel):
    nombre: str | None = None
    apellido: str | None = None
    dni: str | None = None
    fecha_nacimiento: date | None = None
    posicion: str | None = None
    numero_camiseta: int | None = None
    foto_url: str | None = None
    activo: bool | None = None


class JugadorResponse(JugadorBase, TimestampSchema):
    id: int