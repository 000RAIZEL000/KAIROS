from collections import defaultdict
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.equipo import Equipo
from app.models.partido import Partido


def build_table(db: Session, torneo_id: int) -> list[dict]:
    equipos = db.scalars(select(Equipo).where(Equipo.torneo_id == torneo_id)).all()
    partidos = db.scalars(
        select(Partido).where(
            Partido.torneo_id == torneo_id,
            Partido.estado == "Finalizado",
        )
    ).all()

    table = defaultdict(
        lambda: {
            "equipo_id": 0,
            "equipo": "",
            "pj": 0,
            "pg": 0,
            "pe": 0,
            "pp": 0,
            "gf": 0,
            "gc": 0,
            "dg": 0,
            "pts": 0,
        }
    )

    for equipo in equipos:
        table[equipo.id]["equipo_id"] = equipo.id
        table[equipo.id]["equipo"] = equipo.nombre

    for partido in partidos:
        local = table[partido.equipo_local_id]
        visitante = table[partido.equipo_visitante_id]

        local["pj"] += 1
        visitante["pj"] += 1

        local["gf"] += partido.goles_local
        local["gc"] += partido.goles_visitante
        visitante["gf"] += partido.goles_visitante
        visitante["gc"] += partido.goles_local

        if partido.goles_local > partido.goles_visitante:
            local["pg"] += 1
            local["pts"] += 3
            visitante["pp"] += 1
        elif partido.goles_local < partido.goles_visitante:
            visitante["pg"] += 1
            visitante["pts"] += 3
            local["pp"] += 1
        else:
            local["pe"] += 1
            visitante["pe"] += 1
            local["pts"] += 1
            visitante["pts"] += 1

    rows = list(table.values())
    for row in rows:
        row["dg"] = row["gf"] - row["gc"]

    rows.sort(key=lambda x: (x["pts"], x["dg"], x["gf"]), reverse=True)
    return rows