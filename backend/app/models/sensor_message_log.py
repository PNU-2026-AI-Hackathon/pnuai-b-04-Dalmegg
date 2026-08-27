from datetime import datetime, timezone

from typing import Any

from sqlalchemy import DateTime, Integer, JSON, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class SensorMessageLog(Base):
    __tablename__ = "sensor_message_log"
    __table_args__ = (UniqueConstraint("message_id", name="uq_sensor_message_log_message_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    message_id: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    topic: Mapped[str] = mapped_column(String(255), nullable=False)
    payload: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    received_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
