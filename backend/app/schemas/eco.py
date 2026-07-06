from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class EcoContributionCreate(BaseModel):
    weight_kg: Decimal = Field(gt=0, max_digits=10, decimal_places=3)
    memo: str | None = Field(default=None, max_length=255)
    image_url: str | None = Field(default=None, max_length=500)


class EcoContributionAdminCreate(EcoContributionCreate):
    user_id: int = Field(gt=0)


class EcoContributionRead(BaseModel):
    id: int
    user_id: int
    weight_kg: Decimal
    saved_co2_kg: Decimal
    reward_points: int
    memo: str | None
    image_url: str | None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EcoContributionReviewRead(EcoContributionRead):
    reviewed_by_admin_id: int | None
    reviewed_at: datetime | None


class EcoSummary(BaseModel):
    user_id: int
    accumulated_eggshell_kg: Decimal
    saved_co2_kg: Decimal
    reward_points: int
    contribution_count: int
    pending_contribution_count: int


class MyPageRead(BaseModel):
    id: int
    email: str
    full_name: str | None
    is_active: bool
    accumulated_eggshell_kg: Decimal
    saved_co2_kg: Decimal
    reward_points: int
    contribution_count: int
    pending_contribution_count: int
