from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.crud.eco import get_collection_rankings, get_collection_summary, get_collection_trends
from app.crud.user import get_user
from app.db.session import get_db
from app.models.admin_user import AdminUser
from app.schemas.collection import (
    CollectionCreate,
    CollectionRankingItem,
    CollectionRead,
    CollectionSummary,
    CollectionTrendPoint,
)
from app.schemas.eco import EcoContributionAdminCreate
from app.services.eco import record_eggshell_contribution


router = APIRouter(prefix="/collections", tags=["collections"])


@router.get("/summary", response_model=CollectionSummary)
async def read_collection_summary_endpoint(
    _current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    return await get_collection_summary(db)


@router.get("/trends", response_model=list[CollectionTrendPoint])
async def read_collection_trends_endpoint(
    period: str = Query(default="monthly", pattern="^(daily|weekly|monthly)$"),
    _current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    return await get_collection_trends(db, period)


@router.get("/rankings", response_model=list[CollectionRankingItem])
async def read_collection_rankings_endpoint(
    _current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    return await get_collection_rankings(db)


@router.post("", response_model=CollectionRead, status_code=status.HTTP_201_CREATED)
async def create_collection_endpoint(
    collection_in: CollectionCreate,
    _current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    user = await get_user(db, collection_in.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    contribution_in = EcoContributionAdminCreate(
        user_id=collection_in.user_id,
        weight_kg=collection_in.weight_kg,
        memo=collection_in.memo,
    )
    return await record_eggshell_contribution(db, user=user, contribution_in=contribution_in)
