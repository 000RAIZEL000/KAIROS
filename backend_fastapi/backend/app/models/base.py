# =============================================================================
# MODELOS BASE — Clase declarativa y Mixin de timestamps
# =============================================================================
# Este módulo provee los bloques fundamentales que heredan todos los modelos
# SQLAlchemy del proyecto:
#
#   Base         → Clase declarativa de SQLAlchemy (necesaria para el ORM)
#   TimestampMixin → Agrega created_at y updated_at a cualquier modelo
# =============================================================================

from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, DateTime
from sqlalchemy.sql import func


# -----------------------------------------------------------------------------
# Base — Clase declarativa de SQLAlchemy
# -----------------------------------------------------------------------------
# Todos los modelos ORM del proyecto deben heredar de esta clase.
# SQLAlchemy usa Base para registrar las clases de modelo y mapearlas a tablas.
# Al llamar Base.metadata.create_all(engine) se crean todas las tablas en BD.
Base = declarative_base()


# -----------------------------------------------------------------------------
# TimestampMixin — Mixin de auditoría con fechas automáticas
# -----------------------------------------------------------------------------
# Proporciona las columnas de auditoría estándar a cualquier modelo que lo herede.
# No es una tabla por sí sola; sus columnas se agregan a la tabla del modelo hijo.
#
# Uso: class MiModelo(Base, TimestampMixin): ...
class TimestampMixin:
    # Fecha de creación del registro.
    # server_default=func.now() → la BD (no Python) establece el valor al INSERT.
    # timezone=True → almacena con información de zona horaria (UTC recomendado).
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Fecha de última modificación.
    # server_default=func.now() → valor inicial al INSERT.
    # onupdate=func.now()      → se actualiza automáticamente en cada UPDATE.
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

# =============================================================================
# RESUMEN
# =============================================================================
# Todos los modelos de Kairos usan este patrón:
#
#   class User(Base, TimestampMixin):    → tabla "users" con created_at/updated_at
#   class Torneo(Base, TimestampMixin):  → tabla "torneos" con created_at/updated_at
#   (etc.)
#
# server_default vs default:
#   - server_default → la BD calcula el valor (más eficiente, funciona en bulk)
#   - default        → Python calcula el valor antes de enviar a la BD
# =============================================================================
