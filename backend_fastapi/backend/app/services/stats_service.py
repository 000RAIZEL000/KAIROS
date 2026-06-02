from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.models.equipo import Equipo
from app.models.evento_partido import EventoPartido
from app.models.jugador import Jugador
from app.models.partido import Partido


def goleadores(db: Session, torneo_id: int) -> list[dict]:
    stmt = (
        select(
            Jugador.id.label("jugador_id"),
            (Jugador.nombre + " " + Jugador.apellido).label("jugador"),
            Equipo.nombre.label("equipo"),
            func.count(EventoPartido.id).label("goles"),
        )
        .join(EventoPartido, EventoPartido.jugador_id == Jugador.id)
        .join(Equipo, Equipo.id == Jugador.equipo_id)
        .join(Partido, Partido.id == EventoPartido.partido_id)
        .where(
            Partido.torneo_id == torneo_id,
            EventoPartido.tipo_evento == "gol",
        )
        .group_by(Jugador.id, Jugador.nombre, Jugador.apellido, Equipo.nombre)
        .order_by(func.count(EventoPartido.id).desc())
    )

    rows = db.execute(stmt).all()
    return [
        {
            "jugador_id": row.jugador_id,
            "jugador": row.jugador,
            "equipo": row.equipo,
            "goles": row.goles,
        }
        for row in rows
    ]


def tarjetas(db: Session, torneo_id: int) -> list[dict]:
    stmt = (
        select(
            Jugador.id.label("jugador_id"),
            (Jugador.nombre + " " + Jugador.apellido).label("jugador"),
            Equipo.nombre.label("equipo"),
            func.sum(case((EventoPartido.tipo_evento == "amarilla", 1), else_=0)).label("amarillas"),
            func.sum(case((EventoPartido.tipo_evento == "roja", 1), else_=0)).label("rojas"),
        )
        .join(EventoPartido, EventoPartido.jugador_id == Jugador.id)
        .join(Equipo, Equipo.id == Jugador.equipo_id)
        .join(Partido, Partido.id == EventoPartido.partido_id)
        .where(
            Partido.torneo_id == torneo_id,
            EventoPartido.tipo_evento.in_(["amarilla", "roja"]),
        )
        .group_by(Jugador.id, Jugador.nombre, Jugador.apellido, Equipo.nombre)
        .order_by(
            func.sum(case((EventoPartido.tipo_evento == "roja", 1), else_=0)).desc(),
            func.sum(case((EventoPartido.tipo_evento == "amarilla", 1), else_=0)).desc(),
        )
    )

    rows = db.execute(stmt).all()
    return [
        {
            "jugador_id": row.jugador_id,
            "jugador": row.jugador,
            "equipo": row.equipo,
            "amarillas": int(row.amarillas or 0),
            "rojas": int(row.rojas or 0),
        }
        for row in rows
    ]


def resumen_torneo(db: Session, torneo_id: int) -> dict:
    total_equipos = db.scalar(
        select(func.count(Equipo.id)).where(Equipo.torneo_id == torneo_id)
    ) or 0

    total_jugadores = db.scalar(
        select(func.count(Jugador.id))
        .join(Equipo, Equipo.id == Jugador.equipo_id)
        .where(Equipo.torneo_id == torneo_id)
    ) or 0

    total_partidos = db.scalar(
        select(func.count(Partido.id)).where(Partido.torneo_id == torneo_id)
    ) or 0

    partidos_finalizados = db.scalar(
        select(func.count(Partido.id)).where(
            Partido.torneo_id == torneo_id,
            Partido.estado == "Finalizado",
        )
    ) or 0

    goles_sum = db.execute(
        select(
            func.coalesce(func.sum(Partido.goles_local), 0) +
            func.coalesce(func.sum(Partido.goles_visitante), 0)
        ).where(Partido.torneo_id == torneo_id)
    ).scalar_one()

    return {
        "torneo_id": torneo_id,
        "total_equipos": total_equipos,
        "total_jugadores": total_jugadores,
        "total_partidos": total_partidos,
        "partidos_finalizados": partidos_finalizados,
        "total_goles": int(goles_sum or 0),
    }