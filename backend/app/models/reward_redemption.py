from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class RewardRedemption(Base):
    __tablename__ = "reward_redemption"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False, index=True)
    admin_id: Mapped[int | None] = mapped_column(ForeignKey("admin_user.id"), nullable=True, index=True)
    reward_type: Mapped[str] = mapped_column(String(40), nullable=False)
    points_used: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="completed", nullable=False)
    memo: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    user = relationship("User")
    admin = relationship("AdminUser")
