from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class EcoContributionLog(Base):
    __tablename__ = "eco_contribution_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False, index=True)
    weight_kg: Mapped[Decimal] = mapped_column(Numeric(10, 3), nullable=False)
    saved_co2_kg: Mapped[Decimal] = mapped_column(Numeric(10, 4), nullable=False)
    reward_points: Mapped[int] = mapped_column(Integer, nullable=False)
    memo: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    user = relationship("User", back_populates="eco_contribution_logs")
