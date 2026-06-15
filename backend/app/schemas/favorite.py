from pydantic import BaseModel, ConfigDict

from app.schemas.flower import FlowerRead


class FavoriteCreate(BaseModel):
    flower_id: int


class FavoriteRead(BaseModel):
    id: int
    user_id: int
    flower_id: int

    model_config = ConfigDict(from_attributes=True)


class FavoriteWithFlowerRead(FavoriteRead):
    flower: FlowerRead
