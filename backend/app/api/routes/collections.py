from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import bearer_scheme, get_current_admin
from app.core.security import decode_token_payload
from app.crud.admin_user import get_admin
from app.crud.eco import (
    get_collection_rankings,
    get_collection_summary,
    get_collection_trends,
    get_contribution_log,
    list_pending_contribution_logs,
)
from app.crud.revoked_token import is_token_revoked
from app.crud.user import get_user
from app.db.session import get_db
from app.models.admin_user import AdminUser
from app.models.user import User
from app.schemas.collection import (
    CollectionCreate,
    CollectionRankingItem,
    CollectionRead,
    CollectionSummary,
    CollectionTrendPoint,
)
from app.schemas.eco import EcoContributionAdminCreate, EcoContributionCreate
from app.services.eco import (
    approve_eggshell_contribution,
    record_eggshell_contribution,
    reject_eggshell_contribution,
    submit_eggshell_contribution,
)


router = APIRouter(prefix="/collections", tags=["collections"])


async def _get_collection_actor(
    db: AsyncSession,
    credentials: HTTPAuthorizationCredentials | None,
) -> tuple[str, User | AdminUser]:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
        )

    admin_payload = decode_token_payload(credentials.credentials, expected_type="admin")
    if admin_payload is not None:
        jti = admin_payload.get("jti")
        if isinstance(jti, str) and await is_token_revoked(db, jti):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has been revoked.")
        admin = await get_admin(db, int(admin_payload["sub"]))
        if admin is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin user not found.")
        return "admin", admin

    user_payload = decode_token_payload(credentials.credentials, expected_type="user")
    if user_payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token.")
    jti = user_payload.get("jti")
    if isinstance(jti, str) and await is_token_revoked(db, jti):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has been revoked.")
    user = await get_user(db, int(user_payload["sub"]))
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")
    return "user", user


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
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
):
    actor_type, actor = await _get_collection_actor(db, credentials)
    if actor_type == "admin":
        if collection_in.user_id is None:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="user_id is required.")
        user = await get_user(db, collection_in.user_id)
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        contribution_in = EcoContributionAdminCreate(
            user_id=collection_in.user_id,
            weight_kg=collection_in.weight_kg,
            memo=collection_in.memo,
            image_url=collection_in.image_url,
        )
        return await record_eggshell_contribution(db, user=user, contribution_in=contribution_in)

    contribution_in = EcoContributionCreate(
        weight_kg=collection_in.weight_kg,
        memo=collection_in.memo,
        image_url=collection_in.image_url,
    )
    return await submit_eggshell_contribution(db, user=actor, contribution_in=contribution_in)


@router.get("/pending", response_model=list[CollectionRead])
async def list_pending_collections_endpoint(
    _current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    return await list_pending_contribution_logs(db)


@router.patch("/{collection_id}/approve", response_model=CollectionRead)
async def approve_collection_endpoint(
    collection_id: int,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    contribution = await get_contribution_log(db, collection_id)
    if contribution is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found.")
    return await approve_eggshell_contribution(db, contribution=contribution, admin_id=current_admin.id)


@router.patch("/{collection_id}/reject", response_model=CollectionRead)
async def reject_collection_endpoint(
    collection_id: int,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    contribution = await get_contribution_log(db, collection_id)
    if contribution is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found.")
    return await reject_eggshell_contribution(db, contribution=contribution, admin_id=current_admin.id)
