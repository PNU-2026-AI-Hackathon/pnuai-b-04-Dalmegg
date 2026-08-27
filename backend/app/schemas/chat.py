from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ChatRoomRead(BaseModel):
    id: int
    user_id: int
    admin_id: int
    shop_id: int
    bouquet_order_id: int
    unread_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=2000)


class MessageRead(BaseModel):
    id: int
    room_id: int
    sender_type: str
    sender_id: int
    content: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UnreadCountRead(BaseModel):
    room_id: int
    unread_count: int
