from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.eco import MyPageRead
from app.services.eco import build_my_page


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=MyPageRead)
async def read_my_page_endpoint(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await build_my_page(db, current_user)
