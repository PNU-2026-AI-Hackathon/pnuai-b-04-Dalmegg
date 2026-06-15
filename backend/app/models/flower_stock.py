from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class FlowerStock(Base):
    __tablename__ = "flower_stock"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    flower_id: Mapped[int] = mapped_column(ForeignKey("flower.id"), unique=True, nullable=False, index=True)
    quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    flower = relationship("Flower", back_populates="stock")
