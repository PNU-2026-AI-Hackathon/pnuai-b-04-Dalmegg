from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.ai_prototype import (
    AiGrowthImageRead,
    AiGrowthSampleRead,
    AiPrototypeStatus,
    AiTrainingRunRead,
    ImageAnalysisResponse,
    ImageUploadResponse,
    MockGrowthGenerateResponse,
    RecommendedConditions,
    TrainResponse,
)
from app.services.ai_prototype import (
    analyze_growth_image,
    generate_mock_growth_data,
    get_status,
    list_growth_images,
    list_growth_samples,
    list_training_runs,
    save_growth_image,
    train_growth_model,
)


router = APIRouter(prefix="/v1/ai-prototype", tags=["ai-prototype"])


@router.post("/mock-data/generate", response_model=MockGrowthGenerateResponse)
async def generate_mock_growth_data_endpoint(
    count: int = Query(default=100, ge=10, le=1000),
    db: AsyncSession = Depends(get_db),
):
    created, total = await generate_mock_growth_data(db, count=count)
    return MockGrowthGenerateResponse(created=created, total_samples=total)


@router.get("/samples", response_model=list[AiGrowthSampleRead])
async def list_growth_samples_endpoint(
    limit: int = Query(default=100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
):
    return await list_growth_samples(db, limit=limit)


@router.post("/train", response_model=TrainResponse)
async def train_growth_model_endpoint(db: AsyncSession = Depends(get_db)):
    try:
        training_run = await train_growth_model(db)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

    return TrainResponse(
        run_number=training_run.run_number,
        sample_count=training_run.sample_count,
        mock_sample_count=training_run.mock_sample_count,
        camera_sample_count=training_run.camera_sample_count,
        model_type=training_run.model_type,
        r2_score=training_run.r2_score,
        mae=training_run.mae,
        recommended_conditions=RecommendedConditions(
            temperature_c=training_run.recommended_temperature_c,
            humidity_pct=training_run.recommended_humidity_pct,
            soil_moisture_pct=training_run.recommended_soil_moisture_pct,
            light_lux=training_run.recommended_light_lux,
        ),
        predicted_growth_rate=training_run.predicted_growth_rate,
        feature_importance=training_run.feature_importance_json,
        summary=training_run.summary,
    )


@router.get("/training-runs", response_model=list[AiTrainingRunRead])
async def list_training_runs_endpoint(
    limit: int = Query(default=50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    return await list_training_runs(db, limit=limit)


@router.get("/status", response_model=AiPrototypeStatus)
async def get_ai_prototype_status_endpoint(db: AsyncSession = Depends(get_db)):
    return await get_status(db)


@router.post("/images", response_model=ImageUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_growth_image_endpoint(
    image: UploadFile = File(...),
    temperature_c: float = Form(...),
    humidity_pct: float = Form(...),
    soil_moisture_pct: float = Form(...),
    light_lux: float = Form(...),
    captured_at: datetime | None = Form(None),
    db: AsyncSession = Depends(get_db),
):
    image_row = await save_growth_image(
        db,
        image=image,
        captured_at=captured_at,
        temperature_c=temperature_c,
        humidity_pct=humidity_pct,
        soil_moisture_pct=soil_moisture_pct,
        light_lux=light_lux,
    )
    return ImageUploadResponse(image=image_row)


@router.get("/images", response_model=list[AiGrowthImageRead])
async def list_growth_images_endpoint(
    limit: int = Query(default=100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
):
    return await list_growth_images(db, limit=limit)


@router.post("/images/{image_id}/analyze", response_model=ImageAnalysisResponse)
async def analyze_growth_image_endpoint(
    image_id: int,
    db: AsyncSession = Depends(get_db),
):
    try:
        image_row, sample, message = await analyze_growth_image(db, image_id=image_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    return ImageAnalysisResponse(image=image_row, created_sample=sample, message=message)
