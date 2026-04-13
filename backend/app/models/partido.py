from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin


class Partido(Base, TimestampMixin):
    __tablename__ = "partidos"

    id = Column(Integer, primary_key=True, index=True)
    torneo_id = Column(Integer, ForeignKey("torneos.id", ondelete="CASCADE"), nullable=False)
    equipo_local_id = Column(Integer, ForeignKey("equipos.id", ondelete="CASCADE"), nullable=False)
    equipo_visitante_id = Column(Integer, ForeignKey("equipos.id", ondelete="CASCADE"), nullable=False)

    fecha = Column(DateTime(timezone=True), nullable=True)
    estado = Column(String, nullable=False, default="pendiente")
    goles_local = Column(Integer, nullable=False, default=0)
    goles_visitante = Column(Integer, nullable=False, default=0)
    cancha = Column(String, nullable=True)
    jornada = Column(Integer, nullable=True)
    fase = Column(String, nullable=True)
    arbitro = Column(String, nullable=True)
    observaciones = Column(String, nullable=True)

    torneo = relationship("Torneo", back_populates="partidos")
    equipo_local = relationship(
        "Equipo",
        foreign_keys=[equipo_local_id],
        back_populates="partidos_local",
    )
    equipo_visitante = relationship(
        "Equipo",
        foreign_keys=[equipo_visitante_id],
        back_populates="partidos_visitante",
    )
    eventos = relationship("EventoPartido", back_populates="partido", cascade="all, delete-orphan")