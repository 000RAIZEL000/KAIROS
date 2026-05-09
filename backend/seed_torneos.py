"""
Seed script: Inserta varios torneos de ejemplo en la base de datos.
Ejecutar desde la carpeta backend:
    python seed_torneos.py
"""

import sys, os

# Asegurar que podemos importar app.*
sys.path.insert(0, os.path.dirname(__file__))

from datetime import date
from app.db.session import SessionLocal
from app.models.torneo import Torneo

TORNEOS = [
    {
        "nombre": "Copa Élite 2026",
        "deporte": "Fútbol",
        "modalidad": "11 vs 11",
        "descripcion": "El torneo más competitivo de la temporada. Equipos de élite compiten por la copa dorada.",
        "direccion": "Estadio Municipal Central",
        "fecha_inicio": date(2026, 5, 1),
        "fecha_fin": date(2026, 7, 15),
        "estado": "Activo",
    },
    {
        "nombre": "Liga Relámpago Nocturna",
        "deporte": "Fútbol",
        "modalidad": "7 vs 7",
        "descripcion": "Partidos rápidos bajo las luces. Formato eliminación directa con premios en efectivo.",
        "direccion": "Cancha Sintética Los Pinos",
        "fecha_inicio": date(2026, 5, 10),
        "fecha_fin": date(2026, 6, 20),
        "estado": "Activo",
    },
    {
        "nombre": "Torneo Interclubes",
        "deporte": "Fútbol",
        "modalidad": "11 vs 11",
        "descripcion": "Los mejores clubes de la región se enfrentan en un formato de liga con ida y vuelta.",
        "direccion": "Complejo Deportivo Norte",
        "fecha_inicio": date(2026, 6, 1),
        "fecha_fin": date(2026, 9, 30),
        "estado": "Pendiente",
    },
    {
        "nombre": "Copa Barrial Femenina",
        "deporte": "Fútbol",
        "modalidad": "7 vs 7",
        "descripcion": "Torneo femenino que promueve el deporte en los barrios. ¡Inscripciones abiertas!",
        "direccion": "Parque Recreativo Sur",
        "fecha_inicio": date(2026, 5, 15),
        "fecha_fin": date(2026, 7, 30),
        "estado": "Activo",
    },
    {
        "nombre": "Campeonato Veteranos +35",
        "deporte": "Fútbol",
        "modalidad": "11 vs 11",
        "descripcion": "Para los que nunca dejan de jugar. Categoría exclusiva para mayores de 35 años.",
        "direccion": "Cancha El Clásico",
        "fecha_inicio": date(2026, 4, 20),
        "fecha_fin": date(2026, 6, 15),
        "estado": "Activo",
    },
    {
        "nombre": "Futsal Indoor Cup",
        "deporte": "Fútbol Sala",
        "modalidad": "5 vs 5",
        "descripcion": "Competición de futsal en pista cubierta. Velocidad, técnica y mucha emoción.",
        "direccion": "Coliseo Deportivo Central",
        "fecha_inicio": date(2026, 5, 5),
        "fecha_fin": date(2026, 6, 10),
        "estado": "Activo",
    },
    {
        "nombre": "Liga Empresarial 2026",
        "deporte": "Fútbol",
        "modalidad": "7 vs 7",
        "descripcion": "Torneo corporativo donde las empresas de la ciudad compiten por el título.",
        "direccion": "Centro Deportivo Empresarial",
        "fecha_inicio": date(2026, 7, 1),
        "fecha_fin": date(2026, 10, 30),
        "estado": "Pendiente",
    },
    {
        "nombre": "Copa Juvenil Sub-18",
        "deporte": "Fútbol",
        "modalidad": "11 vs 11",
        "descripcion": "Formando las estrellas del mañana. Torneo para categorías juveniles menores de 18 años.",
        "direccion": "Escuela de Fútbol Municipal",
        "fecha_inicio": date(2026, 5, 20),
        "fecha_fin": date(2026, 8, 15),
        "estado": "Activo",
    },
]


def main():
    db = SessionLocal()
    try:
        count_before = db.query(Torneo).count()
        print(f"[INFO] Torneos existentes en la BD: {count_before}")

        added = 0
        for t in TORNEOS:
            # Evitar duplicados por nombre
            exists = db.query(Torneo).filter(Torneo.nombre == t["nombre"]).first()
            if exists:
                print(f"  [SKIP] Ya existe: {t['nombre']}")
                continue

            torneo = Torneo(**t)
            db.add(torneo)
            added += 1
            print(f"  [OK] Creado: {t['nombre']}")

        db.commit()
        count_after = db.query(Torneo).count()
        print(f"\n[DONE] Se agregaron {added} torneos nuevos.")
        print(f"[INFO] Total de torneos en la BD: {count_after}")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
