from pydantic import BaseModel, ConfigDict, Field


class FlowerBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = None
    color: str | None = Field(default=None, max_length=60)
    price: float = Field(gt=0)
    image_url: str | None = Field(default=None, max_length=500)


class FlowerCreate(BaseModel):
    shop_id: int
    name: str = Field(min_length=1, max_length=120)
    description: str | None = None
    color: str | None = Field(default=None, max_length=60)
    price: float = Field(gt=0)
    stock_quantity: int = Field(default=0, ge=0)


class FlowerUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = None
    color: str | None = Field(default=None, max_length=60)
    price: float | None = Field(default=None, gt=0)


class StockUpdate(BaseModel):
    quantity: int = Field(ge=0)


class FlowerRead(FlowerBase):
    id: int
    shop_id: int
    stock_quantity: int

    model_config = ConfigDict(from_attributes=True)
