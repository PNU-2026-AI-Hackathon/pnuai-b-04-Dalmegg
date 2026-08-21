import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.db.base import Base
from app.db.session import get_db
from app.main import create_app
from app.models.sensor_latest import SensorLatest
from app.models.sensor_reading import SensorReading
from app.services.sensor import SensorTelemetryError, handle_telemetry_message
from tests.helpers import register_admin_and_login


pytestmark = pytest.mark.asyncio


async def test_telemetry_updates_latest_and_samples_history(tmp_path):
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'sensors.db'}", future=True)
    SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    topic = "dalmegg/v1/farms/farm-001/devices/device-001/telemetry"
    async with SessionLocal() as db:
        first = await handle_telemetry_message(
            db,
            topic=topic,
            payload=(
                '{"message_id":"msg-001","temperature_c":24.8,"humidity_pct":61.2,'
                '"soil_moisture_pct":38.5,"measured_at":"2026-08-05T12:00:00Z"}'
            ),
        )
        second_payload = (
            '{"message_id":"msg-002","temperature_c":25.1,"humidity_pct":60.5,'
            '"soil_moisture_pct":37.9,"measured_at":"2026-08-05T12:00:05Z"}'
        )
        second = await handle_telemetry_message(
            db,
            topic=topic,
            payload=second_payload,
        )
        third = await handle_telemetry_message(
            db,
            topic=topic,
            payload=(
                '{"message_id":"msg-003","temperature_c":26.0,"humidity_pct":58.0,'
                '"soil_moisture_pct":36.0,"measured_at":"2026-08-05T12:01:00Z"}'
            ),
        )
        duplicate_second = await handle_telemetry_message(db, topic=topic, payload=second_payload)

        assert first is not None
        assert second is None
        assert third is not None
        assert duplicate_second is None

        reading_count = await db.scalar(select(func.count(SensorReading.id)))
        latest = (await db.execute(select(SensorLatest))).scalar_one()

        assert reading_count == 2
        assert latest.message_id == "msg-003"
        assert latest.temperature_c == 26.0

    await engine.dispose()


async def test_telemetry_ignores_duplicate_message_id(tmp_path):
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'duplicate-sensors.db'}", future=True)
    SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    topic = "dalmegg/v1/farms/farm-001/devices/device-001/telemetry"
    payload = (
        '{"message_id":"dup-001","temperature_c":24.8,'
        '"measured_at":"2026-08-05T12:00:00Z"}'
    )
    async with SessionLocal() as db:
        await handle_telemetry_message(db, topic=topic, payload=payload)
        duplicate = await handle_telemetry_message(db, topic=topic, payload=payload)
        reading_count = await db.scalar(select(func.count(SensorReading.id)))

        assert duplicate is None
        assert reading_count == 1

    await engine.dispose()


async def test_telemetry_rejects_invalid_topic_and_payload(tmp_path):
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'invalid-sensors.db'}", future=True)
    SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as db:
        with pytest.raises(SensorTelemetryError):
            await handle_telemetry_message(
                db,
                topic="dalmegg/v1/devices/device-001/telemetry",
                payload='{"message_id":"bad-topic","temperature_c":24.8}',
            )
        with pytest.raises(SensorTelemetryError):
            await handle_telemetry_message(
                db,
                topic="dalmegg/v1/farms/farm-001/devices/device-001/telemetry",
                payload='{"message_id":"bad-payload","humidity_pct":120}',
            )

    await engine.dispose()


async def test_admin_can_read_latest_sensor_reading(tmp_path):
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'sensor-api.db'}", future=True)
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
            payload=(
                '{"message_id":"api-001","temperature_c":24.8,"humidity_pct":61.2,'
                '"measured_at":"2026-08-05T12:00:00Z"}'
            ),
        )

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await register_admin_and_login(client, "sensor-admin@example.com")
        response = await client.get(
            "/api/admin/sensors/farms/farm-001/devices/device-001/readings/latest",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 200
    assert response.json()["message_id"] == "api-001"
    assert response.json()["device"]["device_uid"] == "device-001"

    await engine.dispose()
