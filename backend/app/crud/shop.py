from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.shop import Shop
from app.schemas.shop import ShopCreate, ShopUpdate


async def create_shop(db: AsyncSession, shop_in: ShopCreate, admin_id: int) -> Shop:
    shop = Shop(admin_id=admin_id, **shop_in.model_dump())
    db.add(shop)
    await db.commit()
    await db.refresh(shop)
    return shop


async def get_shop(db: AsyncSession, shop_id: int) -> Shop | None:
    result = await db.execute(select(Shop).where(Shop.id == shop_id))
    return result.scalar_one_or_none()


async def list_shops(db: AsyncSession, region: str | None = None) -> list[Shop]:
    stmt = select(Shop).order_by(Shop.id)
    if region:
        stmt = stmt.where(Shop.region == region)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_shop(db: AsyncSession, shop: Shop, shop_in: ShopUpdate) -> Shop:
    for field, value in shop_in.model_dump(exclude_unset=True).items():
        setattr(shop, field, value)
    await db.commit()
    await db.refresh(shop)
    return shop
