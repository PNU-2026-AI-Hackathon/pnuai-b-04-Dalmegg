from fastapi import APIRouter, HTTPException, status
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.session import get_db
from app.mqtt.client import MqttPublishError, publish_actuator_command, publish_pump_command
from app.schemas.sensor import (
    ActuatorCommandRequest,
    ActuatorCommandResponse,
    ActuatorStateRequest,
    PumpCommandRequest,
    PumpCommandResponse,
)
from app.services.sensor import get_device_by_uid


router = APIRouter(prefix="/v1/farms", tags=["farm-devices"])


async def _publish_device_command(
    *,
    farm_uid: str,
    device_uid: str,
    command: str,
    state: str,
    db: AsyncSession,
) -> tuple[str, str]:
    device = await get_device_by_uid(db, farm_uid=farm_uid, device_uid=device_uid)
    if device is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device is not connected.")

    settings = get_settings()
    try:
        await publish_actuator_command(
            settings,
            farm_uid=farm_uid,
            device_uid=device_uid,
            command=command,
            state=state,
        )
    except MqttPublishError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    topic = f"{settings.mqtt_topic_prefix.strip('/')}/farms/{farm_uid}/devices/{device_uid}/command"
    return topic, command


@router.post("/{farm_uid}/devices/{device_uid}/command", response_model=ActuatorCommandResponse)
async def publish_actuator_command_endpoint(
    farm_uid: str,
    device_uid: str,
    command: ActuatorCommandRequest,
    db: AsyncSession = Depends(get_db),
):
    topic, command_name = await _publish_device_command(
        farm_uid=farm_uid,
        device_uid=device_uid,
        command=command.command,
        state=command.state,
        db=db,
    )
    return ActuatorCommandResponse(
        farm_uid=farm_uid,
        device_uid=device_uid,
        command=command_name,
        state=command.state,
        topic=topic,
        published=True,
    )


@router.post("/{farm_uid}/devices/{device_uid}/pump", response_model=PumpCommandResponse)
async def publish_pump_command_endpoint(
    farm_uid: str,
    device_uid: str,
    command: PumpCommandRequest,
    db: AsyncSession = Depends(get_db),
):
    device = await get_device_by_uid(db, farm_uid=farm_uid, device_uid=device_uid)
    if device is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device is not connected.")

    settings = get_settings()
    try:
        await publish_pump_command(settings, farm_uid=farm_uid, device_uid=device_uid, state=command.state)
    except MqttPublishError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    topic = f"{settings.mqtt_topic_prefix.strip('/')}/farms/{farm_uid}/devices/{device_uid}/command"
    return PumpCommandResponse(
        farm_uid=farm_uid,
        device_uid=device_uid,
        state=command.state,
        topic=topic,
        published=True,
    )


@router.post("/{farm_uid}/devices/{device_uid}/led", response_model=ActuatorCommandResponse)
async def publish_led_command_endpoint(
    farm_uid: str,
    device_uid: str,
    command: ActuatorStateRequest,
    db: AsyncSession = Depends(get_db),
):
    topic, command_name = await _publish_device_command(
        farm_uid=farm_uid,
        device_uid=device_uid,
        command="led",
        state=command.state,
        db=db,
    )
    return ActuatorCommandResponse(
        farm_uid=farm_uid,
        device_uid=device_uid,
        command=command_name,
        state=command.state,
        topic=topic,
        published=True,
    )
