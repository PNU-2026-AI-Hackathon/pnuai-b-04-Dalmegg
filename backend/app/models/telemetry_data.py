from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class TelemetryData(Base):
    __tablename__ = "telemetry_data"
    __table_args__ = (UniqueConstraint("message_id", name="uq_telemetry_data_message_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    device_id: Mapped[int] = mapped_column(ForeignKey("smart_farm_device.id"), nullable=False, index=True)
    message_id: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    temperature_c: Mapped[float | None] = mapped_column(Float)
    humidity_pct: Mapped[float | None] = mapped_column(Float)
    soil_moisture_pct: Mapped[float | None] = mapped_column(Float)
    measured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    received_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    device = relationship("SmartFarmDevice", back_populates="telemetry_data")
