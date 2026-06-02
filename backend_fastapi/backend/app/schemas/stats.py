from pydantic import BaseModel


class TablaRow(BaseModel):
    equipo_id: int
    equipo: str
    pj: int
    pg: int
    pe: int
    pp: int
    gf: int
    gc: int
    dg: int
    pts: int


class GoleadorRow(BaseModel):
    jugador_id: int | None = None
    jugador: str
    equipo: str | None = None
    goles: int


class TarjetaRow(BaseModel):
    jugador_id: int | None = None
    jugador: str
    equipo: str | None = None
    amarillas: int
    rojas: int


class ResumenTorneo(BaseModel):
    torneo_id: int
    total_equipos: int
    total_jugadores: int
    total_partidos: int
    partidos_finalizados: int
    total_goles: int