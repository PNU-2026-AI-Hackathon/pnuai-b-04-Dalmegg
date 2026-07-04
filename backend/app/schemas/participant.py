from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ParticipantRead(BaseModel):
    id: int
    email: EmailStr
    full_name: str | None
    is_active: bool
    accumulated_eggshell_kg: Decimal
    saved_co2_kg: Decimal
    reward_points: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ParticipantPointsRead(BaseModel):
    user_id: int
    accumulated_eggshell_kg: Decimal
    saved_co2_kg: Decimal
    reward_points: int


RewardType = Literal["flower", "workshop", "coupon", "manual"]


class RewardRedemptionCreate(BaseModel):
    reward_type: RewardType
    points: int = Field(gt=0)
    memo: str | None = Field(default=None, max_length=255)


class RewardRedemptionRead(BaseModel):
    id: int
    user_id: int
    admin_id: int | None
    reward_type: str
    points_used: int
    status: str
    memo: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
