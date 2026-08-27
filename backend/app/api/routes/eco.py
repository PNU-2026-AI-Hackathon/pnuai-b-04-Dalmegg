from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin, get_current_user
from app.crud.eco import list_contribution_logs
from app.crud.user import get_user
from app.db.session import get_db
from app.models.admin_user import AdminUser
from app.models.user import User
from app.schemas.eco import EcoContributionAdminCreate, EcoContributionRead, EcoSummary
from app.services.eco import build_eco_summary, record_eggshell_contribution


router = APIRouter(prefix="/eco", tags=["eco"])


@router.post(
    "/contributions",
    response_model=EcoContributionRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_eco_contribution_endpoint(
    contribution_in: EcoContributionAdminCreate,
    _current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    user = await get_user(db, contribution_in.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return await record_eggshell_contribution(db, user=user, contribution_in=contribution_in)


@router.get("/contributions", response_model=list[EcoContributionRead])
async def list_eco_contributions_endpoint(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
):
    return await list_contribution_logs(db, current_user.id, offset=offset, limit=limit)


@router.get("/me/summary", response_model=EcoSummary)
async def read_eco_summary_endpoint(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await build_eco_summary(db, current_user)
