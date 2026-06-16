from decimal import Decimal, ROUND_DOWN

from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.eco import count_contribution_logs, create_contribution_log
from app.models.eco_contribution_log import EcoContributionLog
from app.models.user import User
from app.schemas.eco import EcoContributionCreate, EcoSummary


CO2_SAVED_PER_EGGSHELL_KG = Decimal("0.3700")
REWARD_POINTS_PER_KG = Decimal("100")


def quantize_eggshell_kg(weight_kg: Decimal) -> Decimal:
    return weight_kg.quantize(Decimal("0.001"))


def calculate_saved_co2(weight_kg: Decimal) -> Decimal:
    return (weight_kg * CO2_SAVED_PER_EGGSHELL_KG).quantize(Decimal("0.0001"))


def calculate_reward_points(weight_kg: Decimal) -> int:
    return int((weight_kg * REWARD_POINTS_PER_KG).to_integral_value(rounding=ROUND_DOWN))


async def record_eggshell_contribution(
    db: AsyncSession,
    *,
    user: User,
    contribution_in: EcoContributionCreate,
) -> EcoContributionLog:
    weight_kg = quantize_eggshell_kg(contribution_in.weight_kg)
    saved_co2_kg = calculate_saved_co2(weight_kg)
    reward_points = calculate_reward_points(weight_kg)

    log = await create_contribution_log(
        db,
        user_id=user.id,
        weight_kg=weight_kg,
        saved_co2_kg=saved_co2_kg,
        reward_points=reward_points,
        memo=contribution_in.memo,
    )

    user.accumulated_eggshell_kg = quantize_eggshell_kg(user.accumulated_eggshell_kg + weight_kg)
    user.saved_co2_kg = (user.saved_co2_kg + saved_co2_kg).quantize(Decimal("0.0001"))
    user.reward_points += reward_points

    await db.commit()
    await db.refresh(log)
    await db.refresh(user)
    return log


async def build_eco_summary(db: AsyncSession, user: User) -> EcoSummary:
    contribution_count = await count_contribution_logs(db, user.id)
    return EcoSummary(
        user_id=user.id,
        accumulated_eggshell_kg=user.accumulated_eggshell_kg,
        saved_co2_kg=user.saved_co2_kg,
        reward_points=user.reward_points,
        contribution_count=contribution_count,
    )
