from fastapi import APIRouter, HTTPException, status

from app.core.config import get_settings
from app.mqtt.client import MqttPublishError, publish_pump_command
from app.schemas.sensor import PumpCommandRequest, PumpCommandResponse


router = APIRouter(prefix="/v1/farms", tags=["farm-devices"])


@router.post("/{farm_uid}/devices/{device_uid}/pump", response_model=PumpCommandResponse)
async def publish_pump_command_endpoint(
    farm_uid: str,
    device_uid: str,
    command: PumpCommandRequest,
):
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
