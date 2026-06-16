from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=100)


class UserRead(BaseModel):
    id: int
    email: EmailStr
    full_name: str | None
    is_active: bool
    accumulated_eggshell_kg: float
    saved_co2_kg: float
    reward_points: int

    model_config = ConfigDict(from_attributes=True)
