from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.crud.review import list_reviews_by_shop
from app.db.session import get_db
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewRead
from app.services.review import create_review_and_sync_shop


router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("", response_model=ReviewRead, status_code=201)
async def create_review_endpoint(
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await create_review_and_sync_shop(db, review_in, user_id=current_user.id)


@router.get("/shops/{shop_id}", response_model=list[ReviewRead])
async def list_shop_reviews_endpoint(shop_id: int, db: AsyncSession = Depends(get_db)):
    return await list_reviews_by_shop(db, shop_id)
