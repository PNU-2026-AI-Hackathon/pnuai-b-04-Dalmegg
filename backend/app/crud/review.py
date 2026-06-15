from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.review import Review
from app.models.shop import Shop
from app.schemas.review import ReviewCreate


async def create_review(db: AsyncSession, review_in: ReviewCreate, user_id: int) -> Review:
    review = Review(user_id=user_id, **review_in.model_dump())
    db.add(review)
    await db.flush()
    return review


async def list_reviews_by_shop(db: AsyncSession, shop_id: int) -> list[Review]:
    result = await db.execute(select(Review).where(Review.shop_id == shop_id).order_by(Review.id))
    return list(result.scalars().all())


async def recalculate_shop_rating(db: AsyncSession, shop: Shop) -> Shop:
    result = await db.execute(
        select(func.count(Review.id), func.coalesce(func.avg(Review.rating), 0)).where(Review.shop_id == shop.id)
    )
    review_count, average_rating = result.one()
    shop.review_count = int(review_count)
    shop.average_rating = round(float(average_rating), 2)
    await db.commit()
    await db.refresh(shop)
    return shop
