from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.eco import get_collection_summary, get_collection_trends
from app.models.flower import Flower
from app.models.flower_stock import FlowerStock


WATER_SAVED_LITERS_PER_EGGSHELL_KG = Decimal("3.0")
LOW_STOCK_THRESHOLD = 5


async def get_stock_summary(db: AsyncSession) -> dict:
    total_flower_types_result = await db.execute(select(func.count(Flower.id)))
    total_stock_result = await db.execute(select(func.coalesce(func.sum(FlowerStock.quantity), 0)))
    low_stock_result = await db.execute(
        select(func.count(FlowerStock.id)).where(
            FlowerStock.quantity > 0,
            FlowerStock.quantity <= LOW_STOCK_THRESHOLD,
        )
    )
    out_of_stock_result = await db.execute(
        select(func.count(Flower.id)).outerjoin(Flower.stock).where(
            (FlowerStock.quantity == 0) | (FlowerStock.id.is_(None))
        )
    )
    growing_flower_result = await db.execute(
        select(func.count(FlowerStock.id)).where(FlowerStock.quantity > 0)
    )

    return {
        "total_flower_types": int(total_flower_types_result.scalar_one()),
        "total_stock_quantity": int(total_stock_result.scalar_one()),
        "low_stock_count": int(low_stock_result.scalar_one()),
        "out_of_stock_count": int(out_of_stock_result.scalar_one()),
        "growing_flower_count": int(growing_flower_result.scalar_one()),
    }


async def build_dashboard_summary(db: AsyncSession) -> dict:
    collection_summary = await get_collection_summary(db)
    stock_summary = await get_stock_summary(db)
    collection_stats = await get_collection_trends(db, "daily")
    total_eggshell_kg = collection_summary["total_weight_kg"]

    return {
        "today_eggshell_kg": collection_summary["today_weight_kg"],
        "accumulated_circulation_kg": total_eggshell_kg,
        "growing_flower_count": stock_summary.pop("growing_flower_count"),
        "saved_water_liters": (total_eggshell_kg * WATER_SAVED_LITERS_PER_EGGSHELL_KG).quantize(
            Decimal("0.1")
        ),
        "recent_alerts": [],
        "stock_summary": stock_summary,
        "collection_stats": collection_stats,
    }
