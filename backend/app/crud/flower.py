from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.flower import Flower
from app.models.flower_stock import FlowerStock
from app.models.flower_stock_adjustment import FlowerStockAdjustment
from app.models.shop import Shop
from app.schemas.flower import FlowerCreate, FlowerUpdate, StockAdjustmentCreate, StockUpdate


def flower_to_read_dict(flower: Flower) -> dict:
    return {
        "id": flower.id,
        "shop_id": flower.shop_id,
        "name": flower.name,
        "description": flower.description,
        "color": flower.color,
        "price": flower.price,
        "image_url": flower.image_url,
        "stock_quantity": flower.stock.quantity if flower.stock else 0,
    }


async def create_flower(db: AsyncSession, flower_in: FlowerCreate, image_url: str | None = None) -> Flower:
    flower_data = flower_in.model_dump(exclude={"stock_quantity"})
    flower = Flower(**flower_data, image_url=image_url)
    db.add(flower)
    await db.flush()
    db.add(FlowerStock(flower_id=flower.id, quantity=flower_in.stock_quantity))
    await db.commit()
    return await get_flower(db, flower.id)


async def get_flower(db: AsyncSession, flower_id: int) -> Flower | None:
    result = await db.execute(
        select(Flower).options(selectinload(Flower.stock), selectinload(Flower.shop)).where(Flower.id == flower_id)
    )
    return result.scalar_one_or_none()


async def list_flowers(
    db: AsyncSession,
    shop_id: int | None = None,
    region: str | None = None,
) -> list[Flower]:
    stmt = select(Flower).options(selectinload(Flower.stock), selectinload(Flower.shop)).order_by(Flower.id)
    if shop_id is not None:
        stmt = stmt.where(Flower.shop_id == shop_id)
    if region is not None:
        stmt = stmt.join(Flower.shop).where(Shop.region == region)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_flower(db: AsyncSession, flower: Flower, flower_in: FlowerUpdate) -> Flower:
    for field, value in flower_in.model_dump(exclude_unset=True).items():
        setattr(flower, field, value)
    await db.commit()
    return await get_flower(db, flower.id)


async def update_stock(db: AsyncSession, flower: Flower, stock_in: StockUpdate) -> Flower:
    current_quantity = flower.stock.quantity if flower.stock else 0
    change_quantity = stock_in.quantity - current_quantity
    if flower.stock is None:
        db.add(FlowerStock(flower_id=flower.id, quantity=stock_in.quantity))
    else:
        flower.stock.quantity = stock_in.quantity
    db.add(
        FlowerStockAdjustment(
            flower_id=flower.id,
            change_quantity=change_quantity,
            quantity_after=stock_in.quantity,
            reason="manual_adjustment",
            memo="Updated through stock endpoint.",
        )
    )
    await db.commit()
    return await get_flower(db, flower.id)


async def create_stock_adjustment(
    db: AsyncSession,
    *,
    flower: Flower,
    adjustment_in: StockAdjustmentCreate,
    admin_id: int | None = None,
) -> FlowerStockAdjustment:
    current_quantity = flower.stock.quantity if flower.stock else 0
    quantity_after = current_quantity + adjustment_in.change_quantity
    if quantity_after < 0:
        raise ValueError("Stock quantity cannot be negative.")

    if flower.stock is None:
        db.add(FlowerStock(flower_id=flower.id, quantity=quantity_after))
    else:
        flower.stock.quantity = quantity_after

    adjustment = FlowerStockAdjustment(
        flower_id=flower.id,
        admin_id=admin_id,
        change_quantity=adjustment_in.change_quantity,
        quantity_after=quantity_after,
        reason=adjustment_in.reason,
        memo=adjustment_in.memo,
    )
    db.add(adjustment)
    await db.commit()
    await db.refresh(adjustment)
    return adjustment


async def list_stock_adjustments(db: AsyncSession, flower_id: int) -> list[FlowerStockAdjustment]:
    result = await db.execute(
        select(FlowerStockAdjustment)
        .where(FlowerStockAdjustment.flower_id == flower_id)
        .order_by(FlowerStockAdjustment.created_at.desc(), FlowerStockAdjustment.id.desc())
    )
    return list(result.scalars().all())


async def delete_flower(db: AsyncSession, flower: Flower) -> None:
    await db.delete(flower)
    await db.commit()


async def update_flower_image(db: AsyncSession, flower: Flower, image_url: str) -> Flower:
    flower.image_url = image_url
    await db.commit()
    return await get_flower(db, flower.id)
