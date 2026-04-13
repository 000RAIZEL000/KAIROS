from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin


class EventoPartido(Base, TimestampMixin):
    __tablename__ = "eventos_partido"

    id = Column(Integer, primary_key=True, index=True)
    partido_id = Column(Integer, ForeignKey("partidos.id", ondelete="CASCADE"), nullable=False)
    jugador_id = Column(Integer, ForeignKey("jugadores.id", ondelete="CASCADE"), nullable=True)
    equipo_id = Column(Integer, ForeignKey("equipos.id", ondelete="CASCADE"), nullable=True)

    tipo_evento = Column(String, nullable=False)   # gol, amarilla, roja, asistencia, etc.
    minuto = Column(Integer, nullable=True)
    valor = Column(Integer, nullable=True)
    descripcion = Column(String, nullable=True)

    partido = relationship("Partido", back_populates="eventos")
    jugador = relationship("Jugador", back_populates="eventos")