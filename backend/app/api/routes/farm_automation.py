from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.core.config import get_settings
from app.db.session import get_db
from app.models.admin_user import AdminUser
from app.schemas.farm_automation import (
    FarmAutomationSettingUpdate,
    FarmAutomationStatus,
)
from app.services.farm_automation import (
    evaluate_device_automation,
    read_automation_status,
    update_automation_setting,
)


router = APIRouter(prefix="/admin/farms", tags=["admin-farm-automation"])


@router.get("/{farm_uid}/devices/{device_uid}/automation", response_model=FarmAutomationStatus)
async def read_farm_automation_status_endpoint(
    farm_uid: str,
    device_uid: str,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    automation = await read_automation_status(db, farm_uid=farm_uid, device_uid=device_uid)
    if automation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found.")
    return automation


@router.patch("/{farm_uid}/devices/{device_uid}/automation", response_model=FarmAutomationStatus)
async def update_farm_automation_setting_endpoint(
    farm_uid: str,
    device_uid: str,
    automation_in: FarmAutomationSettingUpdate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    setting = await update_automation_setting(
        db,
        farm_uid=farm_uid,
        device_uid=device_uid,
        values=automation_in.model_dump(exclude_unset=True),
    )
    if setting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found.")
    automation = await read_automation_status(db, farm_uid=farm_uid, device_uid=device_uid)
    return automation


@router.post("/{farm_uid}/devices/{device_uid}/automation/run", response_model=FarmAutomationStatus)
async def run_farm_automation_once_endpoint(
    farm_uid: str,
    device_uid: str,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    actions = await evaluate_device_automation(db, farm_uid=farm_uid, device_uid=device_uid, settings=get_settings())
    automation = await read_automation_status(db, farm_uid=farm_uid, device_uid=device_uid)
    if automation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found.")
    automation["actions"] = actions
    return automation
