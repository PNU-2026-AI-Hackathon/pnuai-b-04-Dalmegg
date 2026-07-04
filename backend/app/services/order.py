from collections import defaultdict

from fastapi import HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.flower import get_flower
from app.crud.order import create_order_with_items
from app.models.flower_stock import FlowerStock
from app.models.flower_stock_adjustment import FlowerStockAdjustment
from app.models.order import Order
from app.models.user import User
from app.schemas.order import OrderCreate


async def create_order_and_decrement_stock(
    db: AsyncSession,
    *,
    user: User,
    order_in: OrderCreate,
) -> Order:
    requested_quantities: dict[int, int] = defaultdict(int)
    for item in order_in.items:
        requested_quantities[item.flower_id] += item.quantity

    order_items = []
    total_amount = 0.0
    try:
        for flower_id, quantity in requested_quantities.items():
            flower = await get_flower(db, flower_id)
            if flower is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Flower not found.")

            result = await db.execute(
                update(FlowerStock)
                .where(FlowerStock.flower_id == flower_id, FlowerStock.quantity >= quantity)
                .values(quantity=FlowerStock.quantity - quantity)
            )
            if result.rowcount != 1:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Not enough flower stock.")
            stock_result = await db.execute(select(FlowerStock).where(FlowerStock.flower_id == flower_id))
            stock = stock_result.scalar_one()
            db.add(
                FlowerStockAdjustment(
                    flower_id=flower_id,
                    change_quantity=-quantity,
                    quantity_after=stock.quantity,
                    reason="sale",
                    memo="Decremented by order creation.",
                )
            )

            line_amount = flower.price * quantity
            total_amount += line_amount
            order_items.append(
                {
                    "flower_id": flower_id,
                    "quantity": quantity,
                    "unit_price": flower.price,
                    "line_amount": line_amount,
                }
            )

        order = await create_order_with_items(db, user_id=user.id, total_amount=total_amount, items=order_items)
        await db.commit()
        return order
    except Exception:
        await db.rollback()
        raise
