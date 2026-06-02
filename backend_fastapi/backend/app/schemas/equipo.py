from pydantic import BaseModel, Field

from app.schemas.common import TimestampSchema


class EquipoBase(BaseModel):
    torneo_id: int
    nombre: str = Field(min_length=2, max_length=120)
    escudo_url: str | None = None
    color_principal: str | None = None
    color_secundario: str | None = None
    grupo: str | None = None
    activo: bool = True


class EquipoCreate(EquipoBase):
    pass


class EquipoUpdate(BaseModel):
    nombre: str | None = None
    escudo_url: str | None = None
    color_principal: str | None = None
    color_secundario: str | None = None
    grupo: str | None = None
    activo: bool | None = None


class EquipoResponse(EquipoBase, TimestampSchema):
    id: int