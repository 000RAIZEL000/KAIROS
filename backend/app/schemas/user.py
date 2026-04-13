from pydantic import BaseModel, EmailStr


class UserPublic(BaseModel):
    id: int
    nombre: str
    email: EmailStr
    telefono: str | None = None
    role: str
    activo: bool

    class Config:
        from_attributes = True