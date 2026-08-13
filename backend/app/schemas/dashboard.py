from decimal import Decimal

from pydantic import BaseModel

from app.schemas.collection import CollectionTrendPoint


class DashboardAlertRead(BaseModel):
    id: int
    type: str
    title: str
    message: str
    severity: str
    is_read: bool


class DashboardStockSummary(BaseModel):
    total_flower_types: int
    total_stock_quantity: int
    low_stock_count: int
    out_of_stock_count: int


class DashboardSummary(BaseModel):
    today_eggshell_kg: Decimal
    accumulated_circulation_kg: Decimal
    growing_flower_count: int
    saved_water_liters: Decimal
    recent_alerts: list[DashboardAlertRead]
    stock_summary: DashboardStockSummary
    collection_stats: list[CollectionTrendPoint]
