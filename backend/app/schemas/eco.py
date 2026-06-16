from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class EcoContributionCreate(BaseModel):
    weight_kg: Decimal = Field(gt=0, max_digits=10, decimal_places=3)
    memo: str | None = Field(default=None, max_length=255)


class EcoContributionAdminCreate(EcoContributionCreate):
    user_id: int = Field(gt=0)


class EcoContributionRead(BaseModel):
    id: int
    user_id: int
    weight_kg: Decimal
    saved_co2_kg: Decimal
    reward_points: int
    memo: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EcoSummary(BaseModel):
    user_id: int
    accumulated_eggshell_kg: Decimal
    saved_co2_kg: Decimal
    reward_points: int
    contribution_count: int
