from pydantic import BaseModel, ConfigDict, Field


class ShopBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    region: str = Field(min_length=1, max_length=80)
    address: str = Field(min_length=1, max_length=255)
    phone: str | None = Field(default=None, max_length=40)
    description: str | None = None


class ShopCreate(ShopBase):
    pass


class ShopUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    region: str | None = Field(default=None, min_length=1, max_length=80)
    address: str | None = Field(default=None, min_length=1, max_length=255)
    phone: str | None = Field(default=None, max_length=40)
    description: str | None = None


class ShopRead(ShopBase):
    id: int
    admin_id: int
    average_rating: float
    review_count: int

    model_config = ConfigDict(from_attributes=True)
