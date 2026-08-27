from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.bouquet_order import BouquetOrder
from app.models.chat_room import ChatRoom
from app.schemas.bouquet import BouquetOrderCreate


def bouquet_order_to_read_dict(order: BouquetOrder) -> dict:
    return {
        "id": order.id,
        "user_id": order.user_id,
        "shop_id": order.shop_id,
        "occasion": order.occasion,
        "recipient": order.recipient,
        "preferred_colors": order.preferred_colors,
        "budget_min": order.budget_min,
        "budget_max": order.budget_max,
        "pickup_or_delivery": order.pickup_or_delivery,
        "requested_date": order.requested_date,
        "message_card": order.message_card,
        "requirements": order.requirements,
        "status": order.status,
        "chat_room_id": order.chat_room.id,
        "created_at": order.created_at,
    }


def bouquet_order_to_admin_read_dict(order: BouquetOrder) -> dict:
    data = bouquet_order_to_read_dict(order)
    data["user_email"] = order.user.email
    data["user_full_name"] = order.user.full_name
    return data


async def create_bouquet_order_with_room(
    db: AsyncSession,
    *,
    user_id: int,
    admin_id: int,
    order_in: BouquetOrderCreate,
) -> BouquetOrder:
    order = BouquetOrder(user_id=user_id, **order_in.model_dump())
    db.add(order)
    await db.flush()
    room = ChatRoom(
        user_id=user_id,
        admin_id=admin_id,
        shop_id=order.shop_id,
        bouquet_order_id=order.id,
    )
    db.add(room)
    await db.commit()
    return await get_bouquet_order(db, order.id)


async def get_bouquet_order(db: AsyncSession, order_id: int) -> BouquetOrder | None:
    result = await db.execute(
        select(BouquetOrder)
        .options(selectinload(BouquetOrder.chat_room), selectinload(BouquetOrder.user))
        .where(BouquetOrder.id == order_id)
    )
    return result.scalar_one_or_none()


async def list_bouquet_orders_by_user(db: AsyncSession, user_id: int) -> list[BouquetOrder]:
    result = await db.execute(
        select(BouquetOrder)
        .options(selectinload(BouquetOrder.chat_room), selectinload(BouquetOrder.user))
        .where(BouquetOrder.user_id == user_id)
        .order_by(BouquetOrder.id.desc())
    )
    return list(result.scalars().all())


async def list_bouquet_orders_by_shop(db: AsyncSession, shop_id: int) -> list[BouquetOrder]:
    result = await db.execute(
        select(BouquetOrder)
        .options(selectinload(BouquetOrder.chat_room), selectinload(BouquetOrder.user))
        .where(BouquetOrder.shop_id == shop_id)
        .order_by(BouquetOrder.id.desc())
    )
    return list(result.scalars().all())
