from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class SmartFarmAutomationSetting(Base):
    __tablename__ = "smart_farm_automation_setting"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    device_id: Mapped[int] = mapped_column(ForeignKey("smart_farm_device.id"), unique=True, nullable=False, index=True)
    enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    light_tolerance_lux: Mapped[float] = mapped_column(Float, default=1000.0, nullable=False)
    pump_run_seconds: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    pump_check_delay_seconds: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    min_water_level_pct: Mapped[float] = mapped_column(Float, default=10.0, nullable=False)
    last_pump_state: Mapped[str | None] = mapped_column(String(10))
    last_led_state: Mapped[str | None] = mapped_column(String(10))
    last_pump_command_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_led_command_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    device = relationship("SmartFarmDevice", back_populates="automation_setting")
