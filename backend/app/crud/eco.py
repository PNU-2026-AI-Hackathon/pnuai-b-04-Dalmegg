from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.eco_contribution_log import EcoContributionLog


async def create_contribution_log(
    db: AsyncSession,
    *,
    user_id: int,
    weight_kg,
    saved_co2_kg,
    reward_points: int,
    memo: str | None,
) -> EcoContributionLog:
    log = EcoContributionLog(
        user_id=user_id,
        weight_kg=weight_kg,
        saved_co2_kg=saved_co2_kg,
        reward_points=reward_points,
        memo=memo,
    )
    db.add(log)
    return log


async def list_contribution_logs(
    db: AsyncSession,
    user_id: int,
    *,
    offset: int = 0,
    limit: int = 20,
) -> list[EcoContributionLog]:
    result = await db.execute(
        select(EcoContributionLog)
        .where(EcoContributionLog.user_id == user_id)
        .order_by(EcoContributionLog.created_at.desc(), EcoContributionLog.id.desc())
        .offset(offset)
        .limit(limit)
    )
    return list(result.scalars().all())


async def count_contribution_logs(db: AsyncSession, user_id: int) -> int:
    result = await db.execute(
        select(func.count(EcoContributionLog.id)).where(EcoContributionLog.user_id == user_id)
    )
    return int(result.scalar_one())
