from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class WorkshopProgramCreate(BaseModel):
    shop_id: int = Field(gt=0)
    title: str = Field(min_length=1, max_length=120)
    description: str | None = None
    materials: str | None = None
    starts_at: datetime
    duration_minutes: int = Field(gt=0)
    capacity: int = Field(gt=0)
    price_per_person: float = Field(gt=0)


class WorkshopProgramRead(BaseModel):
    id: int
    shop_id: int
    title: str
    description: str | None
    materials: str | None
    starts_at: datetime
    duration_minutes: int
    capacity: int
    booked_count: int
    remaining_seats: int
    price_per_person: float


class WorkshopAvailableSlotRead(BaseModel):
    program_id: int
    starts_at: datetime
    capacity: int
    booked_count: int
    remaining_seats: int
    is_available: bool


class WorkshopBookingCreate(BaseModel):
    program_id: int = Field(gt=0)
    participant_count: int = Field(gt=0)


WorkshopBookingStatus = Literal["reserved", "confirmed", "completed", "cancelled", "no_show"]


class WorkshopBookingStatusUpdate(BaseModel):
    status: WorkshopBookingStatus


class WorkshopBookingRead(BaseModel):
    id: int
    user_id: int
    program_id: int
    participant_count: int
    total_amount: float
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminWorkshopBookingRead(BaseModel):
    id: int
    user_id: int
    user_email: str
    user_full_name: str | None
    program_id: int
    program_title: str
    shop_id: int
    participant_count: int
    total_amount: float
    status: str
    created_at: datetime
