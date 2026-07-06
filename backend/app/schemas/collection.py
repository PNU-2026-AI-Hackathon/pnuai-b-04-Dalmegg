from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class CollectionCreate(BaseModel):
    user_id: int | None = Field(default=None, gt=0)
    weight_kg: Decimal = Field(gt=0, max_digits=10, decimal_places=3)
    memo: str | None = Field(default=None, max_length=255)
    image_url: str | None = Field(default=None, max_length=500)


class CollectionRead(BaseModel):
    id: int
    user_id: int
    weight_kg: Decimal
    saved_co2_kg: Decimal
    reward_points: int
    memo: str | None
    image_url: str | None
    status: str
    reviewed_by_admin_id: int | None
    reviewed_at: datetime | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CollectionSummary(BaseModel):
    today_weight_kg: Decimal
    total_weight_kg: Decimal
    total_saved_co2_kg: Decimal
    total_reward_points: int
    participant_count: int
    collection_count: int


class CollectionTrendPoint(BaseModel):
    period: str
    weight_kg: Decimal
    collection_count: int


class CollectionRankingItem(BaseModel):
    rank: int
    user_id: int
    email: str
    full_name: str | None
    total_weight_kg: Decimal
    reward_points: int
    contribution_count: int


class CollectionTrendPeriod(BaseModel):
    period: Literal["daily", "weekly", "monthly"] = "monthly"
