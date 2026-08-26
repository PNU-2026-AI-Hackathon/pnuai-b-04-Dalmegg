from datetime import datetime, timezone
from typing import Any

from sqlalchemy import DateTime, Float, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AiModelTrainingRun(Base):
    __tablename__ = "ai_model_training_run"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    run_number: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    sample_count: Mapped[int] = mapped_column(Integer, nullable=False)
    mock_sample_count: Mapped[int] = mapped_column(Integer, nullable=False)
    camera_sample_count: Mapped[int] = mapped_column(Integer, nullable=False)
    model_type: Mapped[str] = mapped_column(String(80), nullable=False)
    r2_score: Mapped[float] = mapped_column(Float, nullable=False)
    mae: Mapped[float] = mapped_column(Float, nullable=False)
    recommended_temperature_c: Mapped[float] = mapped_column(Float, nullable=False)
    recommended_humidity_pct: Mapped[float] = mapped_column(Float, nullable=False)
    recommended_soil_moisture_pct: Mapped[float] = mapped_column(Float, nullable=False)
    recommended_light_lux: Mapped[float] = mapped_column(Float, nullable=False)
    predicted_growth_rate: Mapped[float] = mapped_column(Float, nullable=False)
    feature_importance_json: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
