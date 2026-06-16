from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin, get_current_user
from app.core.security import decode_access_token
from app.crud.admin_user import get_admin
from app.crud.chat import (
    count_unread_messages,
    create_message,
    get_chat_room,
    list_chat_rooms_by_shop,
    list_chat_rooms_by_user,
    list_messages,
    mark_messages_as_read,
)
from app.crud.shop import get_shop
from app.crud.user import get_user
from app.db.session import get_db
from app.models.admin_user import AdminUser
from app.models.chat_room import ChatRoom
from app.models.user import User
from app.schemas.chat import ChatRoomRead, MessageCreate, MessageRead, UnreadCountRead
from app.services.chat import chat_manager


router = APIRouter(prefix="/chat", tags=["chat"])
admin_router = APIRouter(prefix="/admin/chat", tags=["admin-chat"])


async def _get_user_from_token(db: AsyncSession, token: str) -> User | None:
    subject = decode_access_token(token, expected_type="user")
    return await get_user(db, int(subject)) if subject is not None else None


async def _get_admin_from_token(db: AsyncSession, token: str) -> AdminUser | None:
    subject = decode_access_token(token, expected_type="admin")
    return await get_admin(db, int(subject)) if subject is not None else None


async def _ensure_user_room(db: AsyncSession, room_id: int, user_id: int) -> ChatRoom:
    room = await get_chat_room(db, room_id)
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat room not found.")
    if room.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot access another chat room.")
    return room


async def _ensure_admin_room(db: AsyncSession, room_id: int, admin_id: int) -> ChatRoom:
    room = await get_chat_room(db, room_id)
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat room not found.")
    if room.admin_id != admin_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot access another chat room.")
    return room


async def _ensure_admin_shop(db: AsyncSession, shop_id: int, admin_id: int) -> None:
    shop = await get_shop(db, shop_id)
    if shop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shop not found.")
    if shop.admin_id != admin_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot read another shop's chat rooms.")


def _message_payload(message) -> dict:
    return {
        "id": message.id,
        "room_id": message.room_id,
        "sender_type": message.sender_type,
        "sender_id": message.sender_id,
        "content": message.content,
        "is_read": message.is_read,
        "created_at": message.created_at.isoformat(),
    }


async def _room_to_read_dict(db: AsyncSession, room: ChatRoom, recipient_type: str) -> dict:
    return {
        "id": room.id,
        "user_id": room.user_id,
        "admin_id": room.admin_id,
        "shop_id": room.shop_id,
        "bouquet_order_id": room.bouquet_order_id,
        "unread_count": await count_unread_messages(db, room.id, recipient_type),
        "created_at": room.created_at,
    }


@router.get("/rooms", response_model=list[ChatRoomRead])
async def list_my_chat_rooms_endpoint(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    rooms = await list_chat_rooms_by_user(db, current_user.id)
    return [await _room_to_read_dict(db, room, "user") for room in rooms]


@router.get("/rooms/{room_id}/messages", response_model=list[MessageRead])
async def list_my_messages_endpoint(
    room_id: int,
    current_user: User = Depends(get_current_user),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=30, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    await _ensure_user_room(db, room_id, current_user.id)
    await mark_messages_as_read(db, room_id, "user")
    return await list_messages(db, room_id, offset=offset, limit=limit)


@router.post("/rooms/{room_id}/messages", response_model=MessageRead, status_code=status.HTTP_201_CREATED)
async def create_my_message_endpoint(
    room_id: int,
    message_in: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _ensure_user_room(db, room_id, current_user.id)
    message = await create_message(
        db,
        room_id=room_id,
        sender_type="user",
        sender_id=current_user.id,
        content=message_in.content,
        is_read=chat_manager.has_recipient(room_id, "user"),
    )
    await chat_manager.broadcast(room_id, _message_payload(message))
    return message


@router.get("/rooms/{room_id}/unread-count", response_model=UnreadCountRead)
async def read_my_unread_count_endpoint(
    room_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _ensure_user_room(db, room_id, current_user.id)
    return {"room_id": room_id, "unread_count": await count_unread_messages(db, room_id, "user")}


@router.post("/rooms/{room_id}/read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_my_room_read_endpoint(
    room_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _ensure_user_room(db, room_id, current_user.id)
    await mark_messages_as_read(db, room_id, "user")


@admin_router.get("/rooms", response_model=list[ChatRoomRead])
async def list_admin_chat_rooms_endpoint(
    shop_id: int,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    await _ensure_admin_shop(db, shop_id, current_admin.id)
    rooms = await list_chat_rooms_by_shop(db, shop_id)
    return [await _room_to_read_dict(db, room, "admin") for room in rooms]


@admin_router.get("/rooms/{room_id}/messages", response_model=list[MessageRead])
async def list_admin_messages_endpoint(
    room_id: int,
    current_admin: AdminUser = Depends(get_current_admin),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=30, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    await _ensure_admin_room(db, room_id, current_admin.id)
    await mark_messages_as_read(db, room_id, "admin")
    return await list_messages(db, room_id, offset=offset, limit=limit)


@admin_router.post("/rooms/{room_id}/messages", response_model=MessageRead, status_code=status.HTTP_201_CREATED)
async def create_admin_message_endpoint(
    room_id: int,
    message_in: MessageCreate,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    await _ensure_admin_room(db, room_id, current_admin.id)
    message = await create_message(
        db,
        room_id=room_id,
        sender_type="admin",
        sender_id=current_admin.id,
        content=message_in.content,
        is_read=chat_manager.has_recipient(room_id, "admin"),
    )
    await chat_manager.broadcast(room_id, _message_payload(message))
    return message


@admin_router.get("/rooms/{room_id}/unread-count", response_model=UnreadCountRead)
async def read_admin_unread_count_endpoint(
    room_id: int,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    await _ensure_admin_room(db, room_id, current_admin.id)
    return {"room_id": room_id, "unread_count": await count_unread_messages(db, room_id, "admin")}


@admin_router.post("/rooms/{room_id}/read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_admin_room_read_endpoint(
    room_id: int,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    await _ensure_admin_room(db, room_id, current_admin.id)
    await mark_messages_as_read(db, room_id, "admin")


@router.websocket("/ws/{room_id}")
async def chat_websocket_endpoint(
    websocket: WebSocket,
    room_id: int,
    role: str,
    token: str,
    db: AsyncSession = Depends(get_db),
):
    if role not in {"user", "admin"}:
        await websocket.close(code=1008)
        return

    if role == "user":
        actor = await _get_user_from_token(db, token)
        if actor is None:
            await websocket.close(code=1008)
            return
        try:
            await _ensure_user_room(db, room_id, actor.id)
        except HTTPException:
            await websocket.close(code=1008)
            return
    else:
        actor = await _get_admin_from_token(db, token)
        if actor is None:
            await websocket.close(code=1008)
            return
        try:
            await _ensure_admin_room(db, room_id, actor.id)
        except HTTPException:
            await websocket.close(code=1008)
            return

    await mark_messages_as_read(db, room_id, role)
    await chat_manager.connect(room_id, role, websocket)
    try:
        while True:
            content = await websocket.receive_text()
            message_in = MessageCreate(content=content)
            message = await create_message(
                db,
                room_id=room_id,
                sender_type=role,
                sender_id=actor.id,
                content=message_in.content,
                is_read=chat_manager.has_recipient(room_id, role),
            )
            await chat_manager.broadcast(room_id, _message_payload(message))
    except WebSocketDisconnect:
        chat_manager.disconnect(room_id, role, websocket)
