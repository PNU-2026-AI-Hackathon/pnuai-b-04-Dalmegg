from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class BouquetOrder(Base):
    __tablename__ = "bouquet_order"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False, index=True)
    shop_id: Mapped[int] = mapped_column(ForeignKey("shop.id"), nullable=False, index=True)
    occasion: Mapped[str] = mapped_column(String(120), nullable=False)
    recipient: Mapped[str | None] = mapped_column(String(120))
    preferred_colors: Mapped[str | None] = mapped_column(String(255))
    budget_min: Mapped[float | None] = mapped_column(Float)
    budget_max: Mapped[float | None] = mapped_column(Float)
    pickup_or_delivery: Mapped[str] = mapped_column(String(30), nullable=False)
    requested_date: Mapped[date | None] = mapped_column(Date)
    message_card: Mapped[str | None] = mapped_column(Text)
    requirements: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(30), default="requested", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    user = relationship("User")
    shop = relationship("Shop")
    chat_room = relationship("ChatRoom", back_populates="bouquet_order", uselist=False)
