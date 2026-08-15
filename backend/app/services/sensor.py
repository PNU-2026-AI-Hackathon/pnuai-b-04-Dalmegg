import json
from datetime import datetime, timezone

from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.sensor_latest import SensorLatest
from app.models.sensor_message_log import SensorMessageLog
from app.models.sensor_reading import SensorReading
from app.models.smart_farm_device import SmartFarmDevice
from app.models.telemetry_data import TelemetryData
from app.schemas.sensor import SensorTelemetryPayload


class SensorTelemetryError(ValueError):
    pass


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _ensure_aware(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def parse_telemetry_topic(topic: str, topic_prefix: str = "dalmegg/v1") -> tuple[str, str]:
    prefix_parts = topic_prefix.strip("/").split("/")
    topic_parts = topic.strip("/").split("/")
    expected_length = len(prefix_parts) + 5
    if len(topic_parts) != expected_length or topic_parts[: len(prefix_parts)] != prefix_parts:
        raise SensorTelemetryError("Invalid telemetry topic.")
    if topic_parts[len(prefix_parts)] != "farms" or topic_parts[len(prefix_parts) + 2] != "devices":
        raise SensorTelemetryError("Invalid telemetry topic.")
    if topic_parts[-1] != "telemetry":
        raise SensorTelemetryError("Invalid telemetry topic.")

    farm_uid = topic_parts[len(prefix_parts) + 1]
    device_uid = topic_parts[len(prefix_parts) + 3]
    if not farm_uid or not device_uid:
        raise SensorTelemetryError("Topic must include farm_uid and device_uid.")
    return farm_uid, device_uid


async def get_or_create_device(
    db: AsyncSession,
    *,
    farm_uid: str,
    device_uid: str,
    seen_at: datetime,
) -> SmartFarmDevice:
    result = await db.execute(
        select(SmartFarmDevice).where(
            SmartFarmDevice.farm_uid == farm_uid,
            SmartFarmDevice.device_uid == device_uid,
        )
    )
    device = result.scalar_one_or_none()
    if device is None:
        device = SmartFarmDevice(farm_uid=farm_uid, device_uid=device_uid)
        db.add(device)
        await db.flush()
    device.last_seen_at = seen_at
    return device


async def _should_store_history(
    db: AsyncSession,
    *,
    device_id: int,
    measured_at: datetime,
    interval_seconds: int,
) -> bool:
    result = await db.execute(
        select(SensorReading)
        .where(SensorReading.device_id == device_id)
        .order_by(SensorReading.measured_at.desc(), SensorReading.id.desc())
        .limit(1)
    )
    latest_history = result.scalar_one_or_none()
    if latest_history is None:
        return True
    latest_measured_at = _ensure_aware(latest_history.measured_at)
    return (measured_at - latest_measured_at).total_seconds() >= interval_seconds


async def handle_telemetry_message(
    db: AsyncSession,
    *,
    topic: str,
    payload: bytes | str,
    topic_prefix: str = "dalmegg/v1",
    history_interval_seconds: int = 60,
) -> SensorReading | None:
    farm_uid, device_uid = parse_telemetry_topic(topic, topic_prefix)
    try:
        raw_payload = payload.decode("utf-8") if isinstance(payload, bytes) else payload
        payload_data = json.loads(raw_payload)
        telemetry = SensorTelemetryPayload.model_validate(payload_data)
    except (json.JSONDecodeError, ValidationError) as exc:
        raise SensorTelemetryError("Invalid telemetry payload.") from exc

    received_at = _utc_now()
    measured_at = _ensure_aware(telemetry.measured_at or received_at)

    existing_result = await db.execute(
        select(SensorMessageLog).where(SensorMessageLog.message_id == telemetry.message_id)
    )
    if existing_result.scalar_one_or_none() is not None:
        return None

    device = await get_or_create_device(db, farm_uid=farm_uid, device_uid=device_uid, seen_at=received_at)
    sensor_values = telemetry.model_dump(exclude={"measured_at"})
    latest_values = telemetry.model_dump(exclude={"measured_at"}, exclude_unset=True)
    db.add(SensorMessageLog(message_id=telemetry.message_id, topic=topic, payload=payload_data, received_at=received_at))
    db.add(
        TelemetryData(
            device_id=device.id,
            message_id=telemetry.message_id,
            temperature_c=telemetry.temperature_c,
            humidity_pct=telemetry.humidity_pct,
            soil_moisture_pct=telemetry.soil_moisture_pct,
            measured_at=measured_at,
            received_at=received_at,
        )
    )

    latest_result = await db.execute(select(SensorLatest).where(SensorLatest.device_id == device.id))
    latest = latest_result.scalar_one_or_none()
    if latest is None:
        latest = SensorLatest(device_id=device.id, **sensor_values, measured_at=measured_at, received_at=received_at)
        db.add(latest)
    else:
        for field, value in latest_values.items():
            setattr(latest, field, value)
        latest.measured_at = measured_at
        latest.received_at = received_at

    reading = None
    if await _should_store_history(
        db,
        device_id=device.id,
        measured_at=measured_at,
        interval_seconds=history_interval_seconds,
    ):
        reading = SensorReading(device_id=device.id, **sensor_values, measured_at=measured_at, received_at=received_at)
        db.add(reading)

    await db.commit()
    return reading


async def list_devices(db: AsyncSession) -> list[SmartFarmDevice]:
    result = await db.execute(select(SmartFarmDevice).order_by(SmartFarmDevice.id))
    return list(result.scalars().all())


async def get_device_by_uid(
    db: AsyncSession,
    *,
    device_uid: str,
    farm_uid: str | None = None,
) -> SmartFarmDevice | None:
    stmt = select(SmartFarmDevice).where(SmartFarmDevice.device_uid == device_uid)
    if farm_uid is not None:
        stmt = stmt.where(SmartFarmDevice.farm_uid == farm_uid)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_latest_reading(
    db: AsyncSession,
    *,
    device_uid: str,
    farm_uid: str | None = None,
) -> SensorLatest | None:
    device = await get_device_by_uid(db, device_uid=device_uid, farm_uid=farm_uid)
    if device is None:
        return None
    result = await db.execute(
        select(SensorLatest)
        .options(selectinload(SensorLatest.device))
        .where(SensorLatest.device_id == device.id)
    )
    return result.scalar_one_or_none()


async def list_readings(
    db: AsyncSession,
    *,
    device_uid: str,
    farm_uid: str | None = None,
    limit: int = 100,
) -> list[SensorReading]:
    device = await get_device_by_uid(db, device_uid=device_uid, farm_uid=farm_uid)
    if device is None:
        return []
    result = await db.execute(
        select(SensorReading)
        .where(SensorReading.device_id == device.id)
        .order_by(SensorReading.measured_at.desc(), SensorReading.id.desc())
        .limit(limit)
    )
    return list(result.scalars().all())
