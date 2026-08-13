from pydantic import BaseModel, ConfigDict, Field


class ReviewCreate(BaseModel):
    shop_id: int
    rating: float = Field(ge=1, le=5)
    content: str | None = None


class ReviewRead(BaseModel):
    id: int
    shop_id: int
    user_id: int
    rating: float
    content: str | None

    model_config = ConfigDict(from_attributes=True)
