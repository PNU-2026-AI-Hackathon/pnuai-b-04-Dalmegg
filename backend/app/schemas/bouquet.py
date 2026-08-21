from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator


class BouquetOrderCreate(BaseModel):
    shop_id: int = Field(gt=0)
    occasion: str = Field(min_length=1, max_length=120)
    recipient: str | None = Field(default=None, max_length=120)
    preferred_colors: str | None = Field(default=None, max_length=255)
    budget_min: float | None = Field(default=None, ge=0)
    budget_max: float | None = Field(default=None, ge=0)
    pickup_or_delivery: str = Field(pattern="^(pickup|delivery)$")
    requested_date: date | None = None
    message_card: str | None = None
    requirements: str | None = None

    @model_validator(mode="after")
    def validate_budget_range(self):
        if self.budget_min is not None and self.budget_max is not None and self.budget_min > self.budget_max:
            raise ValueError("budget_min must be less than or equal to budget_max.")
        return self


class BouquetOrderRead(BaseModel):
    id: int
    user_id: int
    shop_id: int
    occasion: str
    recipient: str | None
    preferred_colors: str | None
    budget_min: float | None
    budget_max: float | None
    pickup_or_delivery: str
    requested_date: date | None
    message_card: str | None
    requirements: str | None
    status: str
    chat_room_id: int
    created_at: datetime


class AdminBouquetOrderRead(BouquetOrderRead):
    user_email: str
    user_full_name: str | None

    model_config = ConfigDict(from_attributes=True)
