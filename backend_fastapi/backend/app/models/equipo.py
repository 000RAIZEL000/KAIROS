from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin


class Equipo(Base, TimestampMixin):
    __tablename__ = "equipos"

    id = Column(Integer, primary_key=True, index=True)
    torneo_id = Column(Integer, ForeignKey("torneos.id", ondelete="CASCADE"), nullable=False)
    nombre = Column(String, nullable=False)
    grupo = Column(String, nullable=True)
    color_principal = Column(String, nullable=True)
    color_secundario = Column(String, nullable=True)
    escudo_url = Column(String, nullable=True)
    activo = Column(Boolean, nullable=False, default=True)

    torneo = relationship("Torneo", back_populates="equipos")
    jugadores = relationship("Jugador", back_populates="equipo", cascade="all, delete-orphan")

    partidos_local = relationship(
        "Partido",
        foreign_keys="Partido.equipo_local_id",
        back_populates="equipo_local",
        cascade="all, delete-orphan",
    )
    partidos_visitante = relationship(
        "Partido",
        foreign_keys="Partido.equipo_visitante_id",
        back_populates="equipo_visitante",
        cascade="all, delete-orphan",
    )