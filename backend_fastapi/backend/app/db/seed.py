from datetime import datetime, UTC

from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.models.torneo import Torneo
from app.models.equipo import Equipo
from app.models.jugador import Jugador
from app.models.partido import Partido
from app.models.evento_partido import EventoPartido


def run_seed():
    db = SessionLocal()

    try:
        admin = db.scalar(select(User).where(User.email == "admin@kairos.com"))
        if not admin:
            admin = User(
                nombre="Admin",
                apellido="Kairos",
                email="admin@kairos.com",
                password_hash=get_password_hash("12345678"),
                rol="admin",
                activo=True,
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print("Admin creado: admin@kairos.com / 12345678")
        else:
            print("Admin ya existe")

        torneo = db.scalar(select(Torneo).where(Torneo.nombre == "Liga Apertura 2026"))
        if not torneo:
            torneo = Torneo(
                nombre="Liga Apertura 2026",
                deporte="Fútbol",
                modalidad="11 vs 11",
                descripcion="Torneo de prueba inicial",
                direccion="Cancha Principal",
                estado="Iniciado",
                created_by=admin.id,
            )
            db.add(torneo)
            db.commit()
            db.refresh(torneo)
            print("Torneo creado")
        else:
            print("Torneo ya existe")

        equipo_a = db.scalar(
            select(Equipo).where(
                Equipo.torneo_id == torneo.id,
                Equipo.nombre == "Leones FC",
            )
        )
        if not equipo_a:
            equipo_a = Equipo(
                torneo_id=torneo.id,
                nombre="Leones FC",
                color_principal="#166534",
                color_secundario="#DCFCE7",
                grupo="A",
                activo=True,
            )
            db.add(equipo_a)

        equipo_b = db.scalar(
            select(Equipo).where(
                Equipo.torneo_id == torneo.id,
                Equipo.nombre == "Tigres FC",
            )
        )
        if not equipo_b:
            equipo_b = Equipo(
                torneo_id=torneo.id,
                nombre="Tigres FC",
                color_principal="#14532D",
                color_secundario="#16A34A",
                grupo="A",
                activo=True,
            )
            db.add(equipo_b)

        db.commit()
        db.refresh(equipo_a)
        db.refresh(equipo_b)
        print("Equipos verificados")

        jugadores_a = [
            ("Juan", "Pérez", "Delantero", 9),
            ("Carlos", "Ruiz", "Defensa", 4),
        ]
        jugadores_b = [
            ("Mateo", "Gómez", "Delantero", 10),
            ("Luis", "Martínez", "Arquero", 1),
        ]

        for nombre, apellido, posicion, numero in jugadores_a:
            existe = db.scalar(
                select(Jugador).where(
                    Jugador.equipo_id == equipo_a.id,
                    Jugador.nombre == nombre,
                    Jugador.apellido == apellido,
                )
            )
            if not existe:
                db.add(
                    Jugador(
                        equipo_id=equipo_a.id,
                        nombre=nombre,
                        apellido=apellido,
                        posicion=posicion,
                        numero_camiseta=numero,
                        activo=True,
                    )
                )

        for nombre, apellido, posicion, numero in jugadores_b:
            existe = db.scalar(
                select(Jugador).where(
                    Jugador.equipo_id == equipo_b.id,
                    Jugador.nombre == nombre,
                    Jugador.apellido == apellido,
                )
            )
            if not existe:
                db.add(
                    Jugador(
                        equipo_id=equipo_b.id,
                        nombre=nombre,
                        apellido=apellido,
                        posicion=posicion,
                        numero_camiseta=numero,
                        activo=True,
                    )
                )

        db.commit()
        print("Jugadores verificados")

        partido = db.scalar(
            select(Partido).where(
                Partido.torneo_id == torneo.id,
                Partido.equipo_local_id == equipo_a.id,
                Partido.equipo_visitante_id == equipo_b.id,
            )
        )

        if not partido:
            partido = Partido(
                torneo_id=torneo.id,
                equipo_local_id=equipo_a.id,
                equipo_visitante_id=equipo_b.id,
                fecha=datetime.now(UTC),
                cancha="Cancha 1",
                jornada=1,
                fase="Grupos",
                goles_local=2,
                goles_visitante=1,
                estado="Finalizado",
                arbitro="Pedro Ramírez",
            )
            db.add(partido)
            db.commit()
            db.refresh(partido)
            print("Partido creado")
        else:
            print("Partido ya existe")

        juan = db.scalar(
            select(Jugador).where(
                Jugador.equipo_id == equipo_a.id,
                Jugador.nombre == "Juan",
                Jugador.apellido == "Pérez",
            )
        )
        mateo = db.scalar(
            select(Jugador).where(
                Jugador.equipo_id == equipo_b.id,
                Jugador.nombre == "Mateo",
                Jugador.apellido == "Gómez",
            )
        )

        if juan:
            existe_gol_juan = db.scalar(
                select(EventoPartido).where(
                    EventoPartido.partido_id == partido.id,
                    EventoPartido.jugador_id == juan.id,
                    EventoPartido.tipo_evento == "gol",
                    EventoPartido.minuto == 15,
                )
            )
            if not existe_gol_juan:
                db.add(
                    EventoPartido(
                        partido_id=partido.id,
                        jugador_id=juan.id,
                        equipo_id=equipo_a.id,
                        tipo_evento="gol",
                        minuto=15,
                    )
                )

        if mateo:
            existe_gol_mateo = db.scalar(
                select(EventoPartido).where(
                    EventoPartido.partido_id == partido.id,
                    EventoPartido.jugador_id == mateo.id,
                    EventoPartido.tipo_evento == "gol",
                    EventoPartido.minuto == 30,
                )
            )
            if not existe_gol_mateo:
                db.add(
                    EventoPartido(
                        partido_id=partido.id,
                        jugador_id=mateo.id,
                        equipo_id=equipo_b.id,
                        tipo_evento="gol",
                        minuto=30,
                    )
                )

        if juan:
            existe_gol_juan_2 = db.scalar(
                select(EventoPartido).where(
                    EventoPartido.partido_id == partido.id,
                    EventoPartido.jugador_id == juan.id,
                    EventoPartido.tipo_evento == "gol",
                    EventoPartido.minuto == 70,
                )
            )
            if not existe_gol_juan_2:
                db.add(
                    EventoPartido(
                        partido_id=partido.id,
                        jugador_id=juan.id,
                        equipo_id=equipo_a.id,
                        tipo_evento="gol",
                        minuto=70,
                    )
                )

        db.commit()
        print("Eventos verificados")
        print("Seed completado correctamente")

    finally:
        db.close()


if __name__ == "__main__":
    run_seed()