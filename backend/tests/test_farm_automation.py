from datetime import datetime, timezone

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.db.base import Base
from app.db.session import get_db
from app.main import create_app
from app.models.ai_model_training_run import AiModelTrainingRun
from app.models.sensor_latest import SensorLatest
from app.models.smart_farm_automation_setting import SmartFarmAutomationSetting
from app.models.smart_farm_device import SmartFarmDevice
from app.services import farm_automation
from app.services.sensor import handle_telemetry_message
from tests.helpers import register_admin_and_login


pytestmark = pytest.mark.asyncio


async def test_admin_can_enable_farm_automation(tmp_path):
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'farm-automation-api.db'}", future=True)
    TestingSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async def override_get_db():
        async with TestingSessionLocal() as session:
            yield session

    app = create_app()
    app.dependency_overrides[get_db] = override_get_db

    async with TestingSessionLocal() as db:
        await handle_telemetry_message(
            db,
            topic="dalmegg/v1/farms/farm-001/devices/device-001/telemetry",
            payload='{"message_id":"automation-001","soil_moisture_pct":30,"light_lux":1000}',
        )

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await register_admin_and_login(client, "automation-admin@example.com")
        response = await client.patch(
            "/api/admin/farms/farm-001/devices/device-001/automation",
            json={"enabled": True, "pump_run_seconds": 5, "pump_check_delay_seconds": 10},
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 200
    assert response.json()["setting"]["enabled"] is True
    assert response.json()["setting"]["pump_run_seconds"] == 5
    assert response.json()["setting"]["pump_check_delay_seconds"] == 10

    await engine.dispose()


async def test_pump_control_loop_runs_pulse_until_soil_reaches_target(tmp_path, monkeypatch):
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'farm-automation-loop.db'}", future=True)
    TestingSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    monkeypatch.setattr(farm_automation, "AsyncSessionLocal", TestingSessionLocal)
    published = []

    async def fake_publish_pump_command(settings, *, farm_uid: str, device_uid: str, state: str) -> None:
        published.append((farm_uid, device_uid, state))
        if state == "off":
            async with TestingSessionLocal() as db:
                device = (
                    await db.execute(
                        select(SmartFarmDevice).where(
                            SmartFarmDevice.farm_uid == farm_uid,
                            SmartFarmDevice.device_uid == device_uid,
                        )
                    )
                ).scalar_one()
                latest = (
                    await db.execute(
                        select(SensorLatest).where(SensorLatest.device_id == device.id)
                    )
                ).scalar_one()
                latest.soil_moisture_pct = 52.0
                await db.commit()

    async def no_sleep(seconds: int) -> None:
        return None

    monkeypatch.setattr(farm_automation, "publish_pump_command", fake_publish_pump_command)
    monkeypatch.setattr(farm_automation.asyncio, "sleep", no_sleep)

    async with TestingSessionLocal() as db:
        await handle_telemetry_message(
            db,
            topic="dalmegg/v1/farms/farm-001/devices/device-001/telemetry",
            payload='{"message_id":"loop-001","soil_moisture_pct":40,"water_level_pct":80}',
        )
        device = (
            await db.execute(
                select(SmartFarmDevice).where(
                    SmartFarmDevice.farm_uid == "farm-001",
                    SmartFarmDevice.device_uid == "device-001",
                )
            )
        ).scalar_one()
        db.add(
            SmartFarmAutomationSetting(
                device_id=device.id,
                enabled=True,
                pump_run_seconds=5,
                pump_check_delay_seconds=10,
            )
        )
        db.add(
            AiModelTrainingRun(
                run_number=1,
                sample_count=10,
                mock_sample_count=10,
                camera_sample_count=0,
                model_type="RandomForestRegressor",
                r2_score=0.9,
                mae=0.01,
                recommended_temperature_c=24,
                recommended_humidity_pct=60,
                recommended_soil_moisture_pct=50,
                recommended_light_lux=12000,
                predicted_growth_rate=0.1,
                feature_importance_json={},
                summary="test",
                created_at=datetime.now(timezone.utc),
            )
        )
        await db.commit()

    await farm_automation.run_pump_control_loop(farm_uid="farm-001", device_uid="device-001", max_cycles=3)

    assert published == [
        ("farm-001", "device-001", "on"),
        ("farm-001", "device-001", "off"),
    ]

    await engine.dispose()


async def test_pump_control_loop_does_not_run_when_water_level_is_low(tmp_path, monkeypatch):
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'farm-automation-water.db'}", future=True)
    TestingSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    monkeypatch.setattr(farm_automation, "AsyncSessionLocal", TestingSessionLocal)
    published = []

    async def fake_publish_pump_command(settings, *, farm_uid: str, device_uid: str, state: str) -> None:
        published.append(state)

    monkeypatch.setattr(farm_automation, "publish_pump_command", fake_publish_pump_command)

    async with TestingSessionLocal() as db:
        await handle_telemetry_message(
            db,
            topic="dalmegg/v1/farms/farm-001/devices/device-001/telemetry",
            payload='{"message_id":"water-001","soil_moisture_pct":30,"water_level_pct":5}',
        )
        device = (
            await db.execute(
                select(SmartFarmDevice).where(
                    SmartFarmDevice.farm_uid == "farm-001",
                    SmartFarmDevice.device_uid == "device-001",
                )
            )
        ).scalar_one()
        db.add(SmartFarmAutomationSetting(device_id=device.id, enabled=True, min_water_level_pct=10))
        db.add(
            AiModelTrainingRun(
                run_number=1,
                sample_count=10,
                mock_sample_count=10,
                camera_sample_count=0,
                model_type="RandomForestRegressor",
                r2_score=0.9,
                mae=0.01,
                recommended_temperature_c=24,
                recommended_humidity_pct=60,
                recommended_soil_moisture_pct=50,
                recommended_light_lux=12000,
                predicted_growth_rate=0.1,
                feature_importance_json={},
                summary="test",
            )
        )
        await db.commit()

    await farm_automation.run_pump_control_loop(farm_uid="farm-001", device_uid="device-001", max_cycles=1)

    assert published == []

    await engine.dispose()
