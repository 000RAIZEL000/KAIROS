from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin


class Torneo(Base, TimestampMixin):
    __tablename__ = "torneos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(String, nullable=True)
    deporte = Column(String, nullable=True)
    modalidad = Column(String, nullable=True)
    direccion = Column(String, nullable=True)
    fecha_inicio = Column(Date, nullable=True)
    fecha_fin = Column(Date, nullable=True)
    estado = Column(String, default="Pendiente")
    imagen_url = Column(String, nullable=True)
    activo = Column(Boolean, nullable=False, default=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    usuario = relationship("User", back_populates="torneos")
    equipos = relationship("Equipo", back_populates="torneo", cascade="all, delete-orphan")
    partidos = relationship("Partido", back_populates="torneo", cascade="all, delete-orphan")