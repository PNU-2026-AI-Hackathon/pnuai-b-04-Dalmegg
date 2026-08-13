import asyncio
import logging

from app.core.config import Settings
from app.db.session import AsyncSessionLocal
from app.services.sensor import SensorTelemetryError, handle_telemetry_message


logger = logging.getLogger(__name__)


async def run_mqtt_listener(settings: Settings) -> None:
    try:
        import aiomqtt
    except ImportError:
        logger.warning("MQTT is enabled, but aiomqtt is not installed.")
        return

    topic = f"{settings.mqtt_topic_prefix.strip('/')}/farms/+/devices/+/telemetry"
    while True:
        try:
            async with aiomqtt.Client(
                hostname=settings.mqtt_host,
                port=settings.mqtt_port,
                username=settings.mqtt_username,
                password=settings.mqtt_password,
            ) as client:
                await client.subscribe(topic, qos=1)
                logger.info("Subscribed to MQTT topic: %s", topic)
                async for message in client.messages:
                    async with AsyncSessionLocal() as db:
                        try:
                            await handle_telemetry_message(
                                db,
                                topic=str(message.topic),
                                payload=message.payload,
                                topic_prefix=settings.mqtt_topic_prefix,
                                history_interval_seconds=settings.mqtt_history_interval_seconds,
                            )
                        except SensorTelemetryError:
                            logger.exception("Invalid sensor telemetry message on topic %s", message.topic)
                        except Exception:
                            logger.exception("Failed to process sensor telemetry message on topic %s", message.topic)
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.exception("MQTT listener disconnected. Retrying in 5 seconds.")
            await asyncio.sleep(5)
