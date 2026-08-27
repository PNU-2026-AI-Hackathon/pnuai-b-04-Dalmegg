from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.ai_prototype import RecommendedConditions
from app.schemas.sensor import SensorLatestRead


class FarmAutomationSettingUpdate(BaseModel):
    enabled: bool | None = None
    light_tolerance_lux: float | None = Field(default=None, ge=0, le=10000)
    pump_run_seconds: int | None = Field(default=None, ge=0, le=60)
    pump_check_delay_seconds: int | None = Field(default=None, ge=0, le=300)
    min_water_level_pct: float | None = Field(default=None, ge=0, le=100)


class FarmAutomationSettingRead(BaseModel):
    id: int
    enabled: bool
    light_tolerance_lux: float
    pump_run_seconds: int
    pump_check_delay_seconds: int
    min_water_level_pct: float
    last_pump_state: str | None
    last_led_state: str | None
    last_pump_command_at: datetime | None
    last_led_command_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FarmAutomationAction(BaseModel):
    command: Literal["pump", "led"]
    state: Literal["on", "off"]
    reason: str
    published: bool


class FarmAutomationStatus(BaseModel):
    farm_uid: str
    device_uid: str
    setting: FarmAutomationSettingRead
    latest_reading: SensorLatestRead | None
    recommended_conditions: RecommendedConditions | None
    pump_loop_running: bool
    actions: list[FarmAutomationAction] = []
