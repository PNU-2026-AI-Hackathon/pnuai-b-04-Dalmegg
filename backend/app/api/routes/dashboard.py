from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.crud.dashboard import build_dashboard_summary
from app.db.session import get_db
from app.models.admin_user import AdminUser
from app.schemas.dashboard import DashboardSummary


router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
async def read_dashboard_summary_endpoint(
    _current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    return await build_dashboard_summary(db)
