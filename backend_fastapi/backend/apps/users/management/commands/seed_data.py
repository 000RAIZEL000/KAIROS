from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import date, timedelta


EQUIPOS_DATA = [
    {
        "nombre": "Atlético FC",
        "grupo": "A",
        "color_principal": "Rojo",
        "color_secundario": "Blanco",
        "jugadores": [
            {"nombre": "Mateo",    "apellido": "Rodríguez",  "posicion": "Arquero",   "numero_camiseta": 1,  "dni": "40111001"},
            {"nombre": "Lucas",    "apellido": "Fernández",  "posicion": "Defensor",  "numero_camiseta": 4,  "dni": "40111002"},
            {"nombre": "Tomás",    "apellido": "Gómez",      "posicion": "Defensor",  "numero_camiseta": 5,  "dni": "40111003"},
            {"nombre": "Agustín",  "apellido": "López",      "posicion": "Mediocampo","numero_camiseta": 8,  "dni": "40111004"},
            {"nombre": "Nicolás",  "apellido": "Martínez",   "posicion": "Mediocampo","numero_camiseta": 10, "dni": "40111005"},
            {"nombre": "Santiago", "apellido": "Pérez",      "posicion": "Delantero", "numero_camiseta": 9,  "dni": "40111006"},
        ],
    },
    {
        "nombre": "Deportivo Sur",
        "grupo": "A",
        "color_principal": "Azul",
        "color_secundario": "Amarillo",
        "jugadores": [
            {"nombre": "Franco",   "apellido": "García",     "posicion": "Arquero",   "numero_camiseta": 1,  "dni": "40222001"},
            {"nombre": "Ezequiel", "apellido": "Herrera",    "posicion": "Defensor",  "numero_camiseta": 3,  "dni": "40222002"},
            {"nombre": "Facundo",  "apellido": "Torres",     "posicion": "Defensor",  "numero_camiseta": 6,  "dni": "40222003"},
            {"nombre": "Lautaro",  "apellido": "Díaz",       "posicion": "Mediocampo","numero_camiseta": 7,  "dni": "40222004"},
            {"nombre": "Rodrigo",  "apellido": "Morales",    "posicion": "Delantero", "numero_camiseta": 11, "dni": "40222005"},
            {"nombre": "Valentín", "apellido": "Castro",     "posicion": "Delantero", "numero_camiseta": 99, "dni": "40222006"},
        ],
    },
    {
        "nombre": "Real Norte",
        "grupo": "B",
        "color_principal": "Verde",
        "color_secundario": "Blanco",
        "jugadores": [
            {"nombre": "Ignacio",  "apellido": "Suárez",     "posicion": "Arquero",   "numero_camiseta": 1,  "dni": "40333001"},
            {"nombre": "Maximiliano","apellido": "Vega",     "posicion": "Defensor",  "numero_camiseta": 2,  "dni": "40333002"},
            {"nombre": "Benjamín", "apellido": "Ruiz",       "posicion": "Defensor",  "numero_camiseta": 5,  "dni": "40333003"},
            {"nombre": "Thiago",   "apellido": "Jiménez",    "posicion": "Mediocampo","numero_camiseta": 8,  "dni": "40333004"},
            {"nombre": "Sebastián","apellido": "Acosta",     "posicion": "Delantero", "numero_camiseta": 9,  "dni": "40333005"},
            {"nombre": "Matías",   "apellido": "Romero",     "posicion": "Delantero", "numero_camiseta": 17, "dni": "40333006"},
        ],
    },
    {
        "nombre": "Club Unión",
        "grupo": "B",
        "color_principal": "Negro",
        "color_secundario": "Rojo",
        "jugadores": [
            {"nombre": "Alexis",   "apellido": "Vargas",     "posicion": "Arquero",   "numero_camiseta": 1,  "dni": "40444001"},
            {"nombre": "Federico", "apellido": "Medina",     "posicion": "Defensor",  "numero_camiseta": 4,  "dni": "40444002"},
            {"nombre": "Gonzalo",  "apellido": "Reyes",      "posicion": "Defensor",  "numero_camiseta": 6,  "dni": "40444003"},
            {"nombre": "Emiliano", "apellido": "Ortiz",      "posicion": "Mediocampo","numero_camiseta": 10, "dni": "40444004"},
            {"nombre": "Cristian", "apellido": "Flores",     "posicion": "Mediocampo","numero_camiseta": 14, "dni": "40444005"},
            {"nombre": "Damián",   "apellido": "Soto",       "posicion": "Delantero", "numero_camiseta": 7,  "dni": "40444006"},
        ],
    },
]


class Command(BaseCommand):
    help = "Inserta datos de prueba en producción (torneos, equipos, jugadores, partidos, eventos)."

    def handle(self, *args, **kwargs):
        from apps.torneos.models import Torneo
        from apps.equipos.models import Equipo
        from apps.jugadores.models import Jugador
        from apps.partidos.models import Partido
        from apps.eventos.models import EventoPartido

        User = get_user_model()
        admin = User.objects.filter(is_superuser=True).first()

        hoy = date.today()

        # ── Torneos ───────────────────────────────────────────────────────────
        torneo_activo, created = Torneo.objects.get_or_create(
            nombre="Copa Kairos 2026",
            defaults=dict(
                descripcion="Torneo de fútbol 11 organizado por Kairos AG. Primera edición.",
                deporte="Fútbol",
                modalidad="11 vs 11",
                direccion="Estadio Municipal, Buenos Aires",
                fecha_inicio=hoy - timedelta(days=15),
                fecha_fin=hoy + timedelta(days=30),
                estado="Activo",
                activo=True,
                user=admin,
            ),
        )
        if created:
            self.stdout.write(f"  Torneo creado: {torneo_activo.nombre}")
        else:
            self.stdout.write(f"  Torneo ya existe: {torneo_activo.nombre}")

        torneo_pendiente, created = Torneo.objects.get_or_create(
            nombre="Liga Verano 2026",
            defaults=dict(
                descripcion="Liga de verano formato round-robin. Inscripciones abiertas.",
                deporte="Fútbol",
                modalidad="7 vs 7",
                direccion="Polideportivo Norte, Buenos Aires",
                fecha_inicio=hoy + timedelta(days=30),
                fecha_fin=hoy + timedelta(days=90),
                estado="Pendiente",
                activo=True,
                user=admin,
            ),
        )
        if created:
            self.stdout.write(f"  Torneo creado: {torneo_pendiente.nombre}")
        else:
            self.stdout.write(f"  Torneo ya existe: {torneo_pendiente.nombre}")

        # ── Equipos y jugadores (solo en torneo activo) ───────────────────────
        equipos_obj = []
        for eq_data in EQUIPOS_DATA:
            jugadores_data = eq_data.pop("jugadores")
            equipo, created = Equipo.objects.get_or_create(
                torneo=torneo_activo,
                nombre=eq_data["nombre"],
                defaults=eq_data,
            )
            eq_data["jugadores"] = jugadores_data  # restaurar para siguiente run
            if created:
                self.stdout.write(f"    Equipo creado: {equipo.nombre}")
            else:
                self.stdout.write(f"    Equipo ya existe: {equipo.nombre}")

            for j in jugadores_data:
                _, jcreated = Jugador.objects.get_or_create(
                    equipo=equipo,
                    nombre=j["nombre"],
                    apellido=j["apellido"],
                    defaults=dict(
                        posicion=j["posicion"],
                        numero_camiseta=j["numero_camiseta"],
                        dni=j["dni"],
                        fecha_nacimiento=date(2000, 1, 1),
                        activo=True,
                    ),
                )
                if jcreated:
                    self.stdout.write(f"      Jugador: {j['nombre']} {j['apellido']}")

            equipos_obj.append(equipo)

        atletico, deportivo, real_norte, club_union = equipos_obj

        # ── Partidos ──────────────────────────────────────────────────────────
        partidos_config = [
            # Jornada 1 — finalizados con marcador
            dict(
                torneo=torneo_activo,
                equipo_local=atletico,
                equipo_visitante=deportivo,
                fecha=timezone.make_aware(timezone.datetime(hoy.year, hoy.month, hoy.day) - timedelta(days=14)),
                estado="Finalizado",
                goles_local=3,
                goles_visitante=1,
                cancha="Estadio Municipal - Cancha 1",
                jornada=1,
                fase="Fase de grupos",
                arbitro="Carlos Méndez",
            ),
            dict(
                torneo=torneo_activo,
                equipo_local=real_norte,
                equipo_visitante=club_union,
                fecha=timezone.make_aware(timezone.datetime(hoy.year, hoy.month, hoy.day) - timedelta(days=14)),
                estado="Finalizado",
                goles_local=2,
                goles_visitante=2,
                cancha="Estadio Municipal - Cancha 2",
                jornada=1,
                fase="Fase de grupos",
                arbitro="Roberto Silva",
            ),
            # Jornada 2 — finalizados
            dict(
                torneo=torneo_activo,
                equipo_local=atletico,
                equipo_visitante=real_norte,
                fecha=timezone.make_aware(timezone.datetime(hoy.year, hoy.month, hoy.day) - timedelta(days=7)),
                estado="Finalizado",
                goles_local=1,
                goles_visitante=0,
                cancha="Estadio Municipal - Cancha 1",
                jornada=2,
                fase="Fase de grupos",
                arbitro="Carlos Méndez",
            ),
            dict(
                torneo=torneo_activo,
                equipo_local=club_union,
                equipo_visitante=deportivo,
                fecha=timezone.make_aware(timezone.datetime(hoy.year, hoy.month, hoy.day) - timedelta(days=7)),
                estado="Finalizado",
                goles_local=0,
                goles_visitante=2,
                cancha="Estadio Municipal - Cancha 2",
                jornada=2,
                fase="Fase de grupos",
                arbitro="Roberto Silva",
            ),
            # Jornada 3 — pendientes
            dict(
                torneo=torneo_activo,
                equipo_local=deportivo,
                equipo_visitante=real_norte,
                fecha=timezone.make_aware(timezone.datetime(hoy.year, hoy.month, hoy.day) + timedelta(days=7)),
                estado="Pendiente",
                goles_local=0,
                goles_visitante=0,
                cancha="Estadio Municipal - Cancha 1",
                jornada=3,
                fase="Fase de grupos",
                arbitro="Carlos Méndez",
            ),
            dict(
                torneo=torneo_activo,
                equipo_local=club_union,
                equipo_visitante=atletico,
                fecha=timezone.make_aware(timezone.datetime(hoy.year, hoy.month, hoy.day) + timedelta(days=7)),
                estado="Pendiente",
                goles_local=0,
                goles_visitante=0,
                cancha="Estadio Municipal - Cancha 2",
                jornada=3,
                fase="Fase de grupos",
                arbitro="Roberto Silva",
            ),
        ]

        partidos_obj = []
        for cfg in partidos_config:
            partido, created = Partido.objects.get_or_create(
                torneo=cfg["torneo"],
                equipo_local=cfg["equipo_local"],
                equipo_visitante=cfg["equipo_visitante"],
                jornada=cfg["jornada"],
                defaults={k: v for k, v in cfg.items()
                          if k not in ("torneo", "equipo_local", "equipo_visitante", "jornada")},
            )
            partidos_obj.append(partido)
            if created:
                self.stdout.write(
                    f"  Partido J{cfg['jornada']}: {cfg['equipo_local'].nombre} vs "
                    f"{cfg['equipo_visitante'].nombre} [{cfg['estado']}]"
                )

        # ── Eventos para partidos finalizados ─────────────────────────────────
        # Partido 1: Atlético 3-1 Deportivo
        p1, p2, p3, p4 = partidos_obj[:4]

        def _jugs(equipo):
            return list(equipo.jugadores.all())

        atl = _jugs(atletico)
        dep = _jugs(deportivo)
        rn  = _jugs(real_norte)
        cu  = _jugs(club_union)

        eventos = [
            # Partido 1: Atlético 3 – Deportivo 1
            (p1, atl[5], atletico, "gol",       12, "Gol de penal"),
            (p1, dep[4], deportivo,"gol",        28, None),
            (p1, atl[4], atletico, "gol",        55, "Cabezazo al ángulo"),
            (p1, dep[2], deportivo,"amarilla",   60, "Falta sobre Martínez"),
            (p1, atl[5], atletico, "gol",        78, "Contraataque"),
            (p1, atl[3], atletico, "asistencia", 78, None),

            # Partido 2: Real Norte 2 – Club Unión 2
            (p2, rn[4],  real_norte,"gol",       15, None),
            (p2, cu[3],  club_union,"gol",        33, "Tiro libre"),
            (p2, cu[5],  club_union,"gol",        67, None),
            (p2, rn[5],  real_norte,"gol",        88, "Empate en el descuento"),
            (p2, cu[2],  club_union,"amarilla",   45, None),
            (p2, rn[2],  real_norte,"amarilla",   72, None),

            # Partido 3: Atlético 1 – Real Norte 0
            (p3, atl[4], atletico, "gol",        40, "Remate de zurda"),
            (p3, rn[3],  real_norte,"amarilla",  55, "Protestas"),
            (p3, atl[2], atletico, "amarilla",   80, None),

            # Partido 4: Club Unión 0 – Deportivo 2
            (p4, dep[4], deportivo,"gol",        22, None),
            (p4, dep[3], deportivo,"asistencia", 22, None),
            (p4, dep[5], deportivo,"gol",        58, "Definición mano a mano"),
            (p4, cu[4],  club_union,"roja",       75, "Doble amarilla"),
        ]

        for (partido, jugador, equipo, tipo, minuto, desc) in eventos:
            EventoPartido.objects.get_or_create(
                partido=partido,
                jugador=jugador,
                tipo_evento=tipo,
                minuto=minuto,
                defaults=dict(equipo=equipo, descripcion=desc),
            )

        self.stdout.write(self.style.SUCCESS(
            "\n[kairos] Seed completado: 2 torneos, 4 equipos, 24 jugadores, 6 partidos, 18 eventos."
        ))
