from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin


class Jugador(Base, TimestampMixin):
    __tablename__ = "jugadores"

    id = Column(Integer, primary_key=True, index=True)
    equipo_id = Column(Integer, ForeignKey("equipos.id", ondelete="CASCADE"), nullable=False)
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    dni = Column(String, nullable=True)
    fecha_nacimiento = Column(Date, nullable=True)
    posicion = Column(String, nullable=True)
    numero_camiseta = Column(Integer, nullable=True)
    foto_url = Column(String, nullable=True)
    activo = Column(Boolean, nullable=False, default=True)

    equipo = relationship("Equipo", back_populates="jugadores")
    eventos = relationship("EventoPartido", back_populates="jugador", cascade="all, delete-orphan")