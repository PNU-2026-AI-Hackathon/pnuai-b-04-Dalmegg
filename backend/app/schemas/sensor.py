from datetime import datetime
from typing import Literal

from pydantic import AliasChoices, BaseModel, ConfigDict, Field, model_validator


class SensorTelemetryPayload(BaseModel):
    message_id: str = Field(validation_alias=AliasChoices("message_id", "messageId"), min_length=1, max_length=120)
    temperature_c: float | None = Field(default=None, validation_alias=AliasChoices("temperature_c", "temperature"))
    humidity_pct: float | None = Field(default=None, validation_alias=AliasChoices("humidity_pct", "humidity"), ge=0, le=100)
    soil_moisture_pct: float | None = Field(
        default=None,
        validation_alias=AliasChoices("soil_moisture_pct", "soilMoisture"),
        ge=0,
        le=100,
    )
    light_lux: float | None = Field(default=None, validation_alias=AliasChoices("light_lux", "light"), ge=0)
    water_level_pct: float | None = Field(
        default=None,
        validation_alias=AliasChoices("water_level_pct", "waterLevel"),
        ge=0,
        le=100,
    )
    measured_at: datetime | None = Field(default=None, validation_alias=AliasChoices("measured_at", "measuredAt"))

    @model_validator(mode="after")
    def require_sensor_value(self):
        if all(
            value is None
            for value in (
                self.temperature_c,
                self.humidity_pct,
                self.soil_moisture_pct,
                self.light_lux,
                self.water_level_pct,
            )
        ):
            raise ValueError("At least one sensor value is required.")
        return self


class SmartFarmDeviceRead(BaseModel):
    id: int
    farm_uid: str
    device_uid: str
    name: str | None
    last_seen_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class SmartFarmDeviceConnectRequest(BaseModel):
    farm_uid: str = Field(min_length=1, max_length=80)
    device_uid: str = Field(min_length=1, max_length=80)
    name: str | None = Field(default=None, max_length=120)


class SensorReadingRead(BaseModel):
    id: int
    message_id: str
    temperature_c: float | None
    humidity_pct: float | None
    soil_moisture_pct: float | None
    light_lux: float | None
    water_level_pct: float | None
    measured_at: datetime
    received_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SensorLatestRead(BaseModel):
    device: SmartFarmDeviceRead
    message_id: str
    temperature_c: float | None
    humidity_pct: float | None
    soil_moisture_pct: float | None
    light_lux: float | None
    water_level_pct: float | None
    measured_at: datetime
    received_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ActuatorStateRequest(BaseModel):
    state: Literal["on", "off"]


class ActuatorCommandRequest(ActuatorStateRequest):
    command: Literal["pump", "led"]


class ActuatorCommandResponse(BaseModel):
    farm_uid: str
    device_uid: str
    command: Literal["pump", "led"]
    state: Literal["on", "off"]
    topic: str
    published: bool


class PumpCommandRequest(ActuatorStateRequest):
    pass


class PumpCommandResponse(ActuatorCommandResponse):
    command: Literal["pump"] = "pump"
