from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.eco_contribution_log import EcoContributionLog
from app.models.user import User


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


async def list_all_contribution_logs(db: AsyncSession) -> list[EcoContributionLog]:
    result = await db.execute(select(EcoContributionLog).order_by(EcoContributionLog.created_at))
    return list(result.scalars().all())


async def get_collection_summary(db: AsyncSession) -> dict:
    logs = await list_all_contribution_logs(db)
    today = date.today()
    today_weight = sum(
        (log.weight_kg for log in logs if log.created_at.date() == today),
        Decimal("0.000"),
    )
    total_weight = sum((log.weight_kg for log in logs), Decimal("0.000"))
    total_co2 = sum((log.saved_co2_kg for log in logs), Decimal("0.0000"))
    total_points = sum(log.reward_points for log in logs)
    participant_ids = {log.user_id for log in logs}
    return {
        "today_weight_kg": today_weight,
        "total_weight_kg": total_weight,
        "total_saved_co2_kg": total_co2,
        "total_reward_points": total_points,
        "participant_count": len(participant_ids),
        "collection_count": len(logs),
    }


def _trend_key(value: date, period: str) -> str:
    if period == "daily":
        return value.isoformat()
    if period == "weekly":
        week_start = value - timedelta(days=value.weekday())
        return week_start.isoformat()
    return f"{value.year:04d}-{value.month:02d}"


async def get_collection_trends(db: AsyncSession, period: str) -> list[dict]:
    logs = await list_all_contribution_logs(db)
    grouped: dict[str, dict] = {}
    for log in logs:
        key = _trend_key(log.created_at.date(), period)
        if key not in grouped:
            grouped[key] = {"period": key, "weight_kg": Decimal("0.000"), "collection_count": 0}
        grouped[key]["weight_kg"] += log.weight_kg
        grouped[key]["collection_count"] += 1
    return [grouped[key] for key in sorted(grouped)]


async def get_collection_rankings(db: AsyncSession) -> list[dict]:
    result = await db.execute(select(User).order_by(User.accumulated_eggshell_kg.desc(), User.id))
    users = [user for user in result.scalars().all() if user.accumulated_eggshell_kg > 0]
    rankings = []
    for index, user in enumerate(users, start=1):
        rankings.append(
            {
                "rank": index,
                "user_id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "total_weight_kg": user.accumulated_eggshell_kg,
                "reward_points": user.reward_points,
                "contribution_count": await count_contribution_logs(db, user.id),
            }
        )
    return rankings
