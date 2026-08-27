from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class SmartFarmDevice(Base):
    __tablename__ = "smart_farm_device"
    __table_args__ = (UniqueConstraint("farm_uid", "device_uid", name="uq_smart_farm_device_uid"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    farm_uid: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    device_uid: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    name: Mapped[str | None] = mapped_column(String(120))
    last_seen_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    latest_reading = relationship("SensorLatest", back_populates="device", uselist=False)
    readings = relationship("SensorReading", back_populates="device")
    telemetry_data = relationship("TelemetryData", back_populates="device")
    automation_setting = relationship("SmartFarmAutomationSetting", back_populates="device", uselist=False)
