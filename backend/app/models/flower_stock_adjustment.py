from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class FlowerStockAdjustment(Base):
    __tablename__ = "flower_stock_adjustment"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    flower_id: Mapped[int] = mapped_column(ForeignKey("flower.id"), nullable=False, index=True)
    admin_id: Mapped[int | None] = mapped_column(ForeignKey("admin_user.id"), nullable=True, index=True)
    change_quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    quantity_after: Mapped[int] = mapped_column(Integer, nullable=False)
    reason: Mapped[str] = mapped_column(String(40), nullable=False)
    memo: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    flower = relationship("Flower", back_populates="stock_adjustments")
    admin = relationship("AdminUser")
