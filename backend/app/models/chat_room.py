from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ChatRoom(Base):
    __tablename__ = "chat_room"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False, index=True)
    admin_id: Mapped[int] = mapped_column(ForeignKey("admin_user.id"), nullable=False, index=True)
    shop_id: Mapped[int] = mapped_column(ForeignKey("shop.id"), nullable=False, index=True)
    bouquet_order_id: Mapped[int] = mapped_column(ForeignKey("bouquet_order.id"), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    user = relationship("User")
    admin = relationship("AdminUser")
    shop = relationship("Shop")
    bouquet_order = relationship("BouquetOrder", back_populates="chat_room")
    messages = relationship("Message", back_populates="room")
