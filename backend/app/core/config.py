import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Kairos API"
    APP_ENV: str = "development"
    DEBUG: bool = True

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./kairos_ag.db")

    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", "kairos_ag_secret_key_super_segura_cambiar"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 días

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

# Compatibilidad con imports directos
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
DATABASE_URL = settings.DATABASE_URL