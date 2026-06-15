from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.review import create_review, recalculate_shop_rating
from app.crud.shop import get_shop
from app.models.review import Review
from app.schemas.review import ReviewCreate


async def create_review_and_sync_shop(
    db: AsyncSession,
    review_in: ReviewCreate,
    user_id: int,
) -> Review:
    shop = await get_shop(db, review_in.shop_id)
    if shop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shop not found.")

    review = await create_review(db, review_in, user_id)
    await recalculate_shop_rating(db, shop)
    await db.refresh(review)
    return review
