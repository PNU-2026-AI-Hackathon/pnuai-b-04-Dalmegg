from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.flower import Flower
from app.models.order import Order
from app.models.order_item import OrderItem


async def create_order_with_items(
    db: AsyncSession,
    *,
    user_id: int,
    total_amount: float,
    items: list[dict],
) -> Order:
    order = Order(user_id=user_id, total_amount=total_amount)
    for item in items:
        order.items.append(OrderItem(**item))
    db.add(order)
    await db.flush()
    return order


async def get_order(db: AsyncSession, order_id: int) -> Order | None:
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    return result.scalar_one_or_none()


async def list_orders_by_user(db: AsyncSession, user_id: int) -> list[Order]:
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.user_id == user_id)
        .order_by(Order.id.desc())
    )
    return list(result.scalars().all())


async def list_orders_by_shop(db: AsyncSession, shop_id: int) -> list[Order]:
    result = await db.execute(
        select(Order)
        .join(Order.items)
        .join(OrderItem.flower)
        .options(selectinload(Order.items).selectinload(OrderItem.flower))
        .where(Flower.shop_id == shop_id)
        .order_by(Order.id.desc())
    )
    return list(result.scalars().unique().all())


async def get_order_with_items(db: AsyncSession, order_id: int) -> Order | None:
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.flower))
        .where(Order.id == order_id)
    )
    return result.scalar_one_or_none()
