from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MockGrowthGenerateResponse(BaseModel):
    created: int
    total_samples: int


class AiGrowthSampleRead(BaseModel):
    id: int
    source_type: str
    temperature_c: float
    humidity_pct: float
    soil_moisture_pct: float
    light_lux: float
    leaf_area_px: float | None
    green_ratio: float | None
    growth_rate: float
    growth_score: float
    measured_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AiGrowthImageRead(BaseModel):
    id: int
    image_path: str
    captured_at: datetime
    temperature_c: float
    humidity_pct: float
    soil_moisture_pct: float
    light_lux: float
    leaf_area_px: float | None
    green_ratio: float | None
    yellow_ratio: float | None
    growth_rate: float | None
    analysis_status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RecommendedConditions(BaseModel):
    temperature_c: float
    humidity_pct: float
    soil_moisture_pct: float
    light_lux: float


class AiTrainingRunRead(BaseModel):
    id: int
    run_number: int
    sample_count: int
    mock_sample_count: int
    camera_sample_count: int
    model_type: str
    r2_score: float
    mae: float
    recommended_temperature_c: float
    recommended_humidity_pct: float
    recommended_soil_moisture_pct: float
    recommended_light_lux: float
    predicted_growth_rate: float
    feature_importance_json: dict[str, float]
    summary: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TrainResponse(BaseModel):
    run_number: int
    sample_count: int
    mock_sample_count: int
    camera_sample_count: int
    model_type: str
    r2_score: float
    mae: float
    recommended_conditions: RecommendedConditions
    predicted_growth_rate: float
    feature_importance: dict[str, float]
    summary: str


class AiPrototypeStatus(BaseModel):
    total_samples: int
    mock_samples: int
    camera_samples: int
    total_images: int
    analyzed_images: int
    latest_model: AiTrainingRunRead | None


class ImageUploadResponse(BaseModel):
    image: AiGrowthImageRead


class ImageAnalysisResponse(BaseModel):
    image: AiGrowthImageRead
    created_sample: AiGrowthSampleRead | None
    message: str


class ImageEnvironmentForm(BaseModel):
    temperature_c: float = Field(ge=-20, le=60)
    humidity_pct: float = Field(ge=0, le=100)
    soil_moisture_pct: float = Field(ge=0, le=100)
    light_lux: float = Field(ge=0)
