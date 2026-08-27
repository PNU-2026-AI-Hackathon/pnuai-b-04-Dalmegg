from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.models.admin_user import AdminUser
from app.schemas.sensor import SensorLatestRead, SensorReadingRead, SmartFarmDeviceConnectRequest, SmartFarmDeviceRead
from app.services.sensor import connect_device, get_latest_reading, list_devices, list_readings


router = APIRouter(prefix="/admin/sensors", tags=["admin-sensors"])


@router.get("/devices", response_model=list[SmartFarmDeviceRead])
async def list_sensor_devices_endpoint(
    _current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    return await list_devices(db)


@router.post("/devices", response_model=SmartFarmDeviceRead, status_code=status.HTTP_201_CREATED)
async def connect_sensor_device_endpoint(
    device_in: SmartFarmDeviceConnectRequest,
    _current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    return await connect_device(
        db,
        farm_uid=device_in.farm_uid,
        device_uid=device_in.device_uid,
        name=device_in.name,
    )


@router.get("/farms/{farm_uid}/devices/{device_uid}/readings/latest", response_model=SensorLatestRead)
async def read_latest_sensor_reading_endpoint(
    farm_uid: str,
    device_uid: str,
    _current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    latest = await get_latest_reading(db, farm_uid=farm_uid, device_uid=device_uid)
    if latest is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sensor reading not found.")
    return latest


@router.get("/farms/{farm_uid}/devices/{device_uid}/readings", response_model=list[SensorReadingRead])
async def list_sensor_readings_endpoint(
    farm_uid: str,
    device_uid: str,
    limit: int = Query(default=100, ge=1, le=500),
    _current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    return await list_readings(db, farm_uid=farm_uid, device_uid=device_uid, limit=limit)
