from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    telefono = Column(String, nullable=True) # Necesario para SMS
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, default="user")  # admin | user
    activo = Column(Boolean, nullable=False, default=True)
    
    otp_code = Column(String, nullable=True)
    otp_expiration = Column(DateTime, nullable=True)

    torneos = relationship("Torneo", back_populates="usuario", cascade="all, delete-orphan")