from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AiGrowthSample(Base):
    __tablename__ = "ai_growth_sample"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    source_type: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    temperature_c: Mapped[float] = mapped_column(Float, nullable=False)
    humidity_pct: Mapped[float] = mapped_column(Float, nullable=False)
    soil_moisture_pct: Mapped[float] = mapped_column(Float, nullable=False)
    light_lux: Mapped[float] = mapped_column(Float, nullable=False)
    leaf_area_px: Mapped[float | None] = mapped_column(Float)
    green_ratio: Mapped[float | None] = mapped_column(Float)
    growth_rate: Mapped[float] = mapped_column(Float, nullable=False)
    growth_score: Mapped[float] = mapped_column(Float, nullable=False)
    measured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
