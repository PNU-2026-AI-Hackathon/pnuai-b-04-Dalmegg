from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.favorite import Favorite
from app.models.flower import Flower


async def get_favorite(db: AsyncSession, user_id: int, flower_id: int) -> Favorite | None:
    result = await db.execute(
        select(Favorite).where(Favorite.user_id == user_id, Favorite.flower_id == flower_id)
    )
    return result.scalar_one_or_none()


async def create_favorite(db: AsyncSession, user_id: int, flower_id: int) -> Favorite:
    favorite = Favorite(user_id=user_id, flower_id=flower_id)
    db.add(favorite)
    await db.commit()
    await db.refresh(favorite)
    return favorite


async def list_favorites(db: AsyncSession, user_id: int) -> list[Favorite]:
    result = await db.execute(
        select(Favorite)
        .options(selectinload(Favorite.flower).selectinload(Flower.stock))
        .where(Favorite.user_id == user_id)
        .order_by(Favorite.id)
    )
    return list(result.scalars().all())


async def delete_favorite(db: AsyncSession, favorite: Favorite) -> None:
    await db.delete(favorite)
    await db.commit()
