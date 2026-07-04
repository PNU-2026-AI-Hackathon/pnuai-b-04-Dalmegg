from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.reward_redemption import RewardRedemption
from app.models.user import User
from app.schemas.participant import RewardRedemptionCreate


async def redeem_reward_points(
    db: AsyncSession,
    *,
    user: User,
    reward_in: RewardRedemptionCreate,
    admin_id: int | None,
) -> RewardRedemption:
    if user.reward_points < reward_in.points:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Not enough reward points.")

    user.reward_points -= reward_in.points
    redemption = RewardRedemption(
        user_id=user.id,
        admin_id=admin_id,
        reward_type=reward_in.reward_type,
        points_used=reward_in.points,
        memo=reward_in.memo,
    )
    db.add(redemption)
    await db.commit()
    await db.refresh(redemption)
    await db.refresh(user)
    return redemption
