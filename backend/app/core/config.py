from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[2]
ENV_FILE = BACKEND_DIR / ".env"


class Settings(BaseSettings):
    app_name: str = "app_name"
    api_prefix: str = "/api"
    database_url: str = "mysql+asyncmy://root:password@127.0.0.1:3306/dbname"
    jwt_secret_key: str = Field(default="test", min_length=16)
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    create_tables_on_startup: bool = True
    upload_dir: str = str(BACKEND_DIR / "uploads")

    model_config = SettingsConfigDict(env_file=ENV_FILE, env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
