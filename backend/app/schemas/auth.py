from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    nombre: str
    email: EmailStr
    telefono: str | None = None
    password: str

class ForgotPasswordRequest(BaseModel):
    telefono: str

class ResetPasswordRequest(BaseModel):
    telefono: str
    otp: str
    new_password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    nombre: str
    email: EmailStr
    role: str
    activo: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserOut