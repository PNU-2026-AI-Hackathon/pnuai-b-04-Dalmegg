import asyncio
import logging
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import Settings, get_settings
from app.db.session import AsyncSessionLocal
from app.models.ai_model_training_run import AiModelTrainingRun
from app.models.sensor_latest import SensorLatest
from app.models.smart_farm_automation_setting import SmartFarmAutomationSetting
from app.models.smart_farm_device import SmartFarmDevice
from app.mqtt.client import MqttPublishError, publish_actuator_command, publish_pump_command
from app.services.ai_prototype import get_latest_training_run
from app.services.sensor import get_device_by_uid, get_latest_reading, parse_telemetry_topic


logger = logging.getLogger(__name__)
_pump_tasks: dict[tuple[str, str], asyncio.Task] = {}


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


async def get_or_create_automation_setting(
    db: AsyncSession,
    *,
    farm_uid: str,
    device_uid: str,
) -> SmartFarmAutomationSetting | None:
    device = await get_device_by_uid(db, farm_uid=farm_uid, device_uid=device_uid)
    if device is None:
        return None

    result = await db.execute(
        select(SmartFarmAutomationSetting).where(SmartFarmAutomationSetting.device_id == device.id)
    )
    setting = result.scalar_one_or_none()
    if setting is None:
        setting = SmartFarmAutomationSetting(device_id=device.id)
        db.add(setting)
        await db.commit()
        await db.refresh(setting)
    return setting


async def update_automation_setting(
    db: AsyncSession,
    *,
    farm_uid: str,
    device_uid: str,
    values: dict,
) -> SmartFarmAutomationSetting | None:
    setting = await get_or_create_automation_setting(db, farm_uid=farm_uid, device_uid=device_uid)
    if setting is None:
        return None
    for field, value in values.items():
        if value is not None:
            setattr(setting, field, value)
    setting.updated_at = _utc_now()
    await db.commit()
    await db.refresh(setting)
    return setting


async def _latest_context(
    db: AsyncSession,
    *,
    farm_uid: str,
    device_uid: str,
) -> tuple[SmartFarmDevice | None, SmartFarmAutomationSetting | None, SensorLatest | None, AiModelTrainingRun | None]:
    device_result = await db.execute(
        select(SmartFarmDevice)
        .where(SmartFarmDevice.farm_uid == farm_uid, SmartFarmDevice.device_uid == device_uid)
        .options(selectinload(SmartFarmDevice.automation_setting))
    )
    device = device_result.scalar_one_or_none()
    if device is None:
        return None, None, None, None

    setting = device.automation_setting
    if setting is None:
        setting = SmartFarmAutomationSetting(device_id=device.id)
        db.add(setting)
        await db.commit()
        await db.refresh(setting)

    latest_result = await db.execute(
        select(SensorLatest).options(selectinload(SensorLatest.device)).where(SensorLatest.device_id == device.id)
    )
    latest = latest_result.scalar_one_or_none()
    latest_model = await get_latest_training_run(db)
    return device, setting, latest, latest_model


def is_pump_loop_running(farm_uid: str, device_uid: str) -> bool:
    task = _pump_tasks.get((farm_uid, device_uid))
    return task is not None and not task.done()


async def evaluate_light_automation(
    db: AsyncSession,
    *,
    farm_uid: str,
    device_uid: str,
    settings: Settings | None = None,
) -> list[dict]:
    settings = settings or get_settings()
    _, setting, latest, latest_model = await _latest_context(db, farm_uid=farm_uid, device_uid=device_uid)
    if setting is None or not setting.enabled or latest is None or latest_model is None or latest.light_lux is None:
        return []

    target = latest_model.recommended_light_lux
    next_state = None
    reason = ""
    if latest.light_lux < target:
        next_state = "on"
        reason = "light_lux_below_recommended_value"
    elif latest.light_lux >= target:
        next_state = "off"
        reason = "light_lux_reached_recommended_value"

    if next_state is None or setting.last_led_state == next_state:
        return []

    try:
        await publish_actuator_command(settings, farm_uid=farm_uid, device_uid=device_uid, command="led", state=next_state)
    except MqttPublishError:
        logger.exception("Failed to publish automated LED command.")
        return [{"command": "led", "state": next_state, "reason": reason, "published": False}]

    setting.last_led_state = next_state
    setting.last_led_command_at = _utc_now()
    await db.commit()
    return [{"command": "led", "state": next_state, "reason": reason, "published": True}]


def _pump_is_needed(
    *,
    setting: SmartFarmAutomationSetting,
    latest: SensorLatest | None,
    latest_model: AiModelTrainingRun | None,
) -> bool:
    if latest is None or latest_model is None or latest.soil_moisture_pct is None:
        return False
    if latest.water_level_pct is not None and latest.water_level_pct < setting.min_water_level_pct:
        return False
    return latest.soil_moisture_pct < latest_model.recommended_soil_moisture_pct


async def run_pump_control_loop(
    *,
    farm_uid: str,
    device_uid: str,
    settings: Settings | None = None,
    max_cycles: int | None = None,
) -> None:
    settings = settings or get_settings()
    cycles = 0
    while True:
        async with AsyncSessionLocal() as db:
            _, setting, latest, latest_model = await _latest_context(db, farm_uid=farm_uid, device_uid=device_uid)
            if setting is None or not setting.enabled or not _pump_is_needed(
                setting=setting,
                latest=latest,
                latest_model=latest_model,
            ):
                return

            await publish_pump_command(settings, farm_uid=farm_uid, device_uid=device_uid, state="on")
            setting.last_pump_state = "on"
            setting.last_pump_command_at = _utc_now()
            await db.commit()

        await asyncio.sleep(setting.pump_run_seconds)

        async with AsyncSessionLocal() as db:
            setting = await get_or_create_automation_setting(db, farm_uid=farm_uid, device_uid=device_uid)
            if setting is None:
                return
            await publish_pump_command(settings, farm_uid=farm_uid, device_uid=device_uid, state="off")
            setting.last_pump_state = "off"
            setting.last_pump_command_at = _utc_now()
            await db.commit()

        cycles += 1
        if max_cycles is not None and cycles >= max_cycles:
            return
        await asyncio.sleep(setting.pump_check_delay_seconds)


def ensure_pump_control_loop(*, farm_uid: str, device_uid: str, settings: Settings | None = None) -> bool:
    key = (farm_uid, device_uid)
    task = _pump_tasks.get(key)
    if task is not None and not task.done():
        return False

    async def runner() -> None:
        try:
            await run_pump_control_loop(farm_uid=farm_uid, device_uid=device_uid, settings=settings)
        except MqttPublishError:
            logger.exception("Failed to publish automated pump command.")
        finally:
            _pump_tasks.pop(key, None)

    _pump_tasks[key] = asyncio.create_task(runner())
    return True


async def evaluate_device_automation(
    db: AsyncSession,
    *,
    farm_uid: str,
    device_uid: str,
    settings: Settings | None = None,
) -> list[dict]:
    actions = await evaluate_light_automation(db, farm_uid=farm_uid, device_uid=device_uid, settings=settings)
    _, setting, latest, latest_model = await _latest_context(db, farm_uid=farm_uid, device_uid=device_uid)
    if setting is not None and setting.enabled and _pump_is_needed(setting=setting, latest=latest, latest_model=latest_model):
        started = ensure_pump_control_loop(farm_uid=farm_uid, device_uid=device_uid, settings=settings)
        actions.append(
            {
                "command": "pump",
                "state": "on",
                "reason": "soil_moisture_below_recommended_range",
                "published": started,
            }
        )
    return actions


async def evaluate_automation_for_telemetry_topic(
    db: AsyncSession,
    *,
    topic: str,
    topic_prefix: str,
    settings: Settings | None = None,
) -> list[dict]:
    farm_uid, device_uid = parse_telemetry_topic(topic, topic_prefix)
    return await evaluate_device_automation(db, farm_uid=farm_uid, device_uid=device_uid, settings=settings)


async def read_automation_status(
    db: AsyncSession,
    *,
    farm_uid: str,
    device_uid: str,
) -> dict | None:
    setting = await get_or_create_automation_setting(db, farm_uid=farm_uid, device_uid=device_uid)
    if setting is None:
        return None
    latest = await get_latest_reading(db, farm_uid=farm_uid, device_uid=device_uid)
    latest_model = await get_latest_training_run(db)
    recommended = None
    if latest_model is not None:
        recommended = {
            "temperature_c": latest_model.recommended_temperature_c,
            "humidity_pct": latest_model.recommended_humidity_pct,
            "soil_moisture_pct": latest_model.recommended_soil_moisture_pct,
            "light_lux": latest_model.recommended_light_lux,
        }
    return {
        "farm_uid": farm_uid,
        "device_uid": device_uid,
        "setting": setting,
        "latest_reading": latest,
        "recommended_conditions": recommended,
        "pump_loop_running": is_pump_loop_running(farm_uid, device_uid),
        "actions": [],
    }
