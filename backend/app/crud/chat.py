from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.chat_room import ChatRoom
from app.models.message import Message


async def get_chat_room(db: AsyncSession, room_id: int) -> ChatRoom | None:
    result = await db.execute(select(ChatRoom).where(ChatRoom.id == room_id))
    return result.scalar_one_or_none()


async def list_chat_rooms_by_user(db: AsyncSession, user_id: int) -> list[ChatRoom]:
    result = await db.execute(
        select(ChatRoom).where(ChatRoom.user_id == user_id).order_by(ChatRoom.id.desc())
    )
    return list(result.scalars().all())


async def list_chat_rooms_by_shop(db: AsyncSession, shop_id: int) -> list[ChatRoom]:
    result = await db.execute(
        select(ChatRoom).where(ChatRoom.shop_id == shop_id).order_by(ChatRoom.id.desc())
    )
    return list(result.scalars().all())


async def create_message(
    db: AsyncSession,
    *,
    room_id: int,
    sender_type: str,
    sender_id: int,
    content: str,
    is_read: bool = False,
) -> Message:
    message = Message(
        room_id=room_id,
        sender_type=sender_type,
        sender_id=sender_id,
        content=content,
        is_read=is_read,
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return message


async def list_messages(
    db: AsyncSession,
    room_id: int,
    *,
    offset: int = 0,
    limit: int = 30,
) -> list[Message]:
    result = await db.execute(
        select(Message)
        .where(Message.room_id == room_id)
        .order_by(Message.id.desc())
        .offset(offset)
        .limit(limit)
    )
    return list(reversed(result.scalars().all()))


async def count_unread_messages(db: AsyncSession, room_id: int, recipient_type: str) -> int:
    sender_type = "admin" if recipient_type == "user" else "user"
    result = await db.execute(
        select(func.count(Message.id)).where(
            Message.room_id == room_id,
            Message.sender_type == sender_type,
            Message.is_read.is_(False),
        )
    )
    return int(result.scalar_one())


async def mark_messages_as_read(db: AsyncSession, room_id: int, recipient_type: str) -> None:
    sender_type = "admin" if recipient_type == "user" else "user"
    await db.execute(
        update(Message)
        .where(
            Message.room_id == room_id,
            Message.sender_type == sender_type,
            Message.is_read.is_(False),
        )
        .values(is_read=True)
    )
    await db.commit()
