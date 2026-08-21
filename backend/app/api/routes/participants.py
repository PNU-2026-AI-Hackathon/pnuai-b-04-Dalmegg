from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.crud.reward import redeem_reward_points
from app.crud.user import get_user
from app.db.session import get_db
from app.models.admin_user import AdminUser
from app.models.user import User
from app.schemas.participant import (
    ParticipantPointsRead,
    ParticipantRead,
    RewardRedemptionCreate,
    RewardRedemptionRead,
)


router = APIRouter(prefix="/participants", tags=["participants"])


@router.get("", response_model=list[ParticipantRead])
async def list_participants_endpoint(
    q: str | None = None,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    _current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(User).order_by(User.accumulated_eggshell_kg.desc(), User.id).offset(offset).limit(limit)
    if q:
        like = f"%{q}%"
        stmt = (
            select(User)
            .where((User.email.like(like)) | (User.full_name.like(like)))
            .order_by(User.accumulated_eggshell_kg.desc(), User.id)
            .offset(offset)
            .limit(limit)
        )
    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.get("/{participant_id}/points", response_model=ParticipantPointsRead)
async def read_participant_points_endpoint(
    participant_id: int,
    _current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    user = await get_user(db, participant_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return {
        "user_id": user.id,
        "accumulated_eggshell_kg": user.accumulated_eggshell_kg,
        "saved_co2_kg": user.saved_co2_kg,
        "reward_points": user.reward_points,
    }


@router.post("/{participant_id}/rewards", response_model=RewardRedemptionRead, status_code=status.HTTP_201_CREATED)
async def create_participant_reward_endpoint(
    participant_id: int,
    reward_in: RewardRedemptionCreate,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    user = await get_user(db, participant_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return await redeem_reward_points(db, user=user, reward_in=reward_in, admin_id=current_admin.id)
