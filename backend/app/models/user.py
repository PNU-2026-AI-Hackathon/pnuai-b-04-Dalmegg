from datetime import datetime, timezone

from decimal import Decimal

from sqlalchemy import Boolean, DateTime, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(100))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    accumulated_eggshell_kg: Mapped[Decimal] = mapped_column(
        Numeric(10, 3), default=Decimal("0.000"), nullable=False
    )
    saved_co2_kg: Mapped[Decimal] = mapped_column(Numeric(10, 4), default=Decimal("0.0000"), nullable=False)
    reward_points: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    reviews = relationship("Review", back_populates="user")
    favorites = relationship("Favorite", back_populates="user")
    eco_contribution_logs = relationship("EcoContributionLog", back_populates="user")
