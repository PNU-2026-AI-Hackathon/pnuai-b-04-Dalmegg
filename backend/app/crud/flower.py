from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.flower import Flower
from app.models.flower_stock import FlowerStock
from app.models.shop import Shop
from app.schemas.flower import FlowerCreate, FlowerUpdate, StockUpdate


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
    if flower.stock is None:
        db.add(FlowerStock(flower_id=flower.id, quantity=stock_in.quantity))
    else:
        flower.stock.quantity = stock_in.quantity
    await db.commit()
    return await get_flower(db, flower.id)


async def update_flower_image(db: AsyncSession, flower: Flower, image_url: str) -> Flower:
    flower.image_url = image_url
    await db.commit()
    return await get_flower(db, flower.id)
