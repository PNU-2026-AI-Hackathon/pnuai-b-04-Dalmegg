from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class FlowerBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = None
    color: str | None = Field(default=None, max_length=60)
    price: float = Field(ge=0)
    image_url: str | None = Field(default=None, max_length=500)


class FlowerCreate(BaseModel):
    shop_id: int
    name: str = Field(min_length=1, max_length=120)
    description: str | None = None
    color: str | None = Field(default=None, max_length=60)
    price: float = Field(ge=0)
    stock_quantity: int = Field(default=0, ge=0)


class FlowerUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = None
    color: str | None = Field(default=None, max_length=60)
    price: float | None = Field(default=None, ge=0)


class StockUpdate(BaseModel):
    quantity: int = Field(ge=0)


StockAdjustmentReason = Literal["harvest", "sale", "discard", "manual_adjustment"]


class StockAdjustmentCreate(BaseModel):
    change_quantity: int
    reason: StockAdjustmentReason
    memo: str | None = Field(default=None, max_length=255)

    @field_validator("change_quantity")
    @classmethod
    def validate_change_quantity(cls, value: int) -> int:
        if value == 0:
            raise ValueError("change_quantity must not be 0.")
        return value


class StockAdjustmentRead(BaseModel):
    id: int
    flower_id: int
    admin_id: int | None
    change_quantity: int
    quantity_after: int
    reason: str
    memo: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FlowerRead(FlowerBase):
    id: int
    shop_id: int
    stock_quantity: int

    model_config = ConfigDict(from_attributes=True)
