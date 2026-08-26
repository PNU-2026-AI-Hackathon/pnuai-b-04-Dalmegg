import math
import random
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.ai_growth_image import AiGrowthImage
from app.models.ai_growth_sample import AiGrowthSample
from app.models.ai_model_training_run import AiModelTrainingRun


FEATURE_NAMES = ["temperature_c", "humidity_pct", "soil_moisture_pct", "light_lux", "green_ratio"]
ALLOWED_IMAGE_CONTENT_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _score_distance(value: float, optimum: float, width: float) -> float:
    return ((value - optimum) / width) ** 2


def _synthetic_growth_values(
    *,
    temperature_c: float,
    humidity_pct: float,
    soil_moisture_pct: float,
    light_lux: float,
    green_ratio: float,
) -> tuple[float, float]:
    penalty = (
        _score_distance(temperature_c, 24.5, 5.0)
        + _score_distance(humidity_pct, 63.0, 18.0)
        + _score_distance(soil_moisture_pct, 52.0, 14.0)
        + _score_distance(light_lux, 13500.0, 6000.0)
        + _score_distance(green_ratio, 0.72, 0.35)
    )
    base_score = 100.0 * math.exp(-0.34 * penalty)
    growth_score = max(0.0, min(100.0, base_score + random.gauss(0, 4.0)))
    growth_rate = max(-0.05, min(0.16, (growth_score - 45.0) / 650.0 + random.gauss(0, 0.006)))
    return round(growth_rate, 5), round(growth_score, 2)


async def generate_mock_growth_data(db: AsyncSession, *, count: int) -> tuple[int, int]:
    now = _utc_now()
    for _ in range(count):
        temperature_c = random.uniform(16.0, 34.0)
        humidity_pct = random.uniform(30.0, 90.0)
        soil_moisture_pct = random.uniform(20.0, 80.0)
        light_lux = random.uniform(3000.0, 22000.0)
        green_ratio = random.uniform(0.25, 0.9)
        growth_rate, growth_score = _synthetic_growth_values(
            temperature_c=temperature_c,
            humidity_pct=humidity_pct,
            soil_moisture_pct=soil_moisture_pct,
            light_lux=light_lux,
            green_ratio=green_ratio,
        )
        db.add(
            AiGrowthSample(
                source_type="mock",
                temperature_c=round(temperature_c, 2),
                humidity_pct=round(humidity_pct, 2),
                soil_moisture_pct=round(soil_moisture_pct, 2),
                light_lux=round(light_lux, 2),
                leaf_area_px=None,
                green_ratio=round(green_ratio, 4),
                growth_rate=growth_rate,
                growth_score=growth_score,
                measured_at=now,
            )
        )
    await db.commit()
    total = await db.scalar(select(func.count(AiGrowthSample.id)))
    return count, int(total or 0)


async def list_growth_samples(db: AsyncSession, *, limit: int = 100) -> list[AiGrowthSample]:
    result = await db.execute(
        select(AiGrowthSample).order_by(AiGrowthSample.created_at.desc(), AiGrowthSample.id.desc()).limit(limit)
    )
    return list(result.scalars().all())


async def list_growth_images(db: AsyncSession, *, limit: int = 100) -> list[AiGrowthImage]:
    result = await db.execute(
        select(AiGrowthImage).order_by(AiGrowthImage.captured_at.desc(), AiGrowthImage.id.desc()).limit(limit)
    )
    return list(result.scalars().all())


async def list_training_runs(db: AsyncSession, *, limit: int = 50) -> list[AiModelTrainingRun]:
    result = await db.execute(
        select(AiModelTrainingRun).order_by(AiModelTrainingRun.run_number.desc(), AiModelTrainingRun.id.desc()).limit(limit)
    )
    return list(result.scalars().all())


async def get_latest_training_run(db: AsyncSession) -> AiModelTrainingRun | None:
    result = await db.execute(
        select(AiModelTrainingRun).order_by(AiModelTrainingRun.run_number.desc(), AiModelTrainingRun.id.desc()).limit(1)
    )
    return result.scalar_one_or_none()


async def train_growth_model(db: AsyncSession) -> AiModelTrainingRun:
    try:
        import numpy as np
        from sklearn.ensemble import RandomForestRegressor
        from sklearn.metrics import mean_absolute_error, r2_score
        from sklearn.model_selection import train_test_split
    except ImportError as exc:
        raise RuntimeError("scikit-learn and numpy are required for AI prototype training.") from exc

    result = await db.execute(select(AiGrowthSample).order_by(AiGrowthSample.id))
    samples = list(result.scalars().all())
    if len(samples) < 10:
        raise ValueError("At least 10 growth samples are required to train the model.")

    x = np.array(
        [
            [
                sample.temperature_c,
                sample.humidity_pct,
                sample.soil_moisture_pct,
                sample.light_lux,
                sample.green_ratio or 0.5,
            ]
            for sample in samples
        ],
        dtype=float,
    )
    y = np.array([sample.growth_rate for sample in samples], dtype=float)

    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.25, random_state=42)
    model = RandomForestRegressor(n_estimators=120, random_state=42, min_samples_leaf=2)
    model.fit(x_train, y_train)
    predictions = model.predict(x_test)

    r2 = float(r2_score(y_test, predictions)) if len(y_test) > 1 else 0.0
    mae = float(mean_absolute_error(y_test, predictions))

    candidates = np.column_stack(
        [
            np.random.uniform(18.0, 32.0, 5000),
            np.random.uniform(35.0, 85.0, 5000),
            np.random.uniform(25.0, 75.0, 5000),
            np.random.uniform(5000.0, 21000.0, 5000),
            np.random.uniform(0.35, 0.9, 5000),
        ]
    )
    candidate_predictions = model.predict(candidates)
    best_index = int(np.argmax(candidate_predictions))
    best = candidates[best_index]
    predicted_growth_rate = float(candidate_predictions[best_index])

    latest_run = await get_latest_training_run(db)
    run_number = 1 if latest_run is None else latest_run.run_number + 1
    mock_count = sum(1 for sample in samples if sample.source_type == "mock")
    camera_count = sum(1 for sample in samples if sample.source_type == "camera")
    feature_importance = {
        name: round(float(value), 4) for name, value in zip(FEATURE_NAMES, model.feature_importances_, strict=True)
    }
    summary = (
        f"RandomForestRegressor trained with {len(samples)} samples. "
        f"Best predicted growth rate is {predicted_growth_rate:.4f} under the recommended conditions."
    )
    training_run = AiModelTrainingRun(
        run_number=run_number,
        sample_count=len(samples),
        mock_sample_count=mock_count,
        camera_sample_count=camera_count,
        model_type="RandomForestRegressor",
        r2_score=round(r2, 4),
        mae=round(mae, 5),
        recommended_temperature_c=round(float(best[0]), 2),
        recommended_humidity_pct=round(float(best[1]), 2),
        recommended_soil_moisture_pct=round(float(best[2]), 2),
        recommended_light_lux=round(float(best[3]), 2),
        predicted_growth_rate=round(predicted_growth_rate, 5),
        feature_importance_json=feature_importance,
        summary=summary,
    )
    db.add(training_run)
    await db.commit()
    await db.refresh(training_run)
    return training_run


async def save_growth_image(
    db: AsyncSession,
    *,
    image: UploadFile,
    captured_at: datetime | None,
    temperature_c: float,
    humidity_pct: float,
    soil_moisture_pct: float,
    light_lux: float,
) -> AiGrowthImage:
    if image.content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only JPEG, PNG, and WebP images are supported.",
        )

    settings = get_settings()
    upload_dir = Path(settings.upload_dir) / "ai-prototype"
    upload_dir.mkdir(parents=True, exist_ok=True)

    suffix = ALLOWED_IMAGE_CONTENT_TYPES[image.content_type]
    filename = f"{uuid4().hex}{suffix}"
    destination = upload_dir / filename
    destination.write_bytes(await image.read())

    image_row = AiGrowthImage(
        image_path=f"/uploads/ai-prototype/{filename}",
        captured_at=captured_at or _utc_now(),
        temperature_c=temperature_c,
        humidity_pct=humidity_pct,
        soil_moisture_pct=soil_moisture_pct,
        light_lux=light_lux,
        analysis_status="pending",
    )
    db.add(image_row)
    await db.commit()
    await db.refresh(image_row)
    return image_row


async def analyze_growth_image(db: AsyncSession, *, image_id: int) -> tuple[AiGrowthImage, AiGrowthSample | None, str]:
    try:
        import cv2
        import numpy as np
    except ImportError as exc:
        raise RuntimeError("opencv-python-headless and numpy are required for image analysis.") from exc

    image_row = await db.get(AiGrowthImage, image_id)
    if image_row is None:
        raise ValueError("Image not found.")

    settings = get_settings()
    relative_path = image_row.image_path.removeprefix("/uploads/").strip("/")
    image_path = Path(settings.upload_dir).joinpath(*relative_path.split("/"))
    image = cv2.imread(str(image_path))
    if image is None:
        raise ValueError("Image file cannot be read.")

    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    green_mask = cv2.inRange(hsv, np.array([35, 35, 35]), np.array([90, 255, 255]))
    yellow_mask = cv2.inRange(hsv, np.array([18, 45, 45]), np.array([34, 255, 255]))
    total_pixels = float(image.shape[0] * image.shape[1])
    leaf_area_px = float(cv2.countNonZero(green_mask))
    green_ratio = leaf_area_px / total_pixels if total_pixels else 0.0
    yellow_ratio = float(cv2.countNonZero(yellow_mask)) / total_pixels if total_pixels else 0.0

    previous_result = await db.execute(
        select(AiGrowthImage)
        .where(AiGrowthImage.id != image_row.id)
        .where(AiGrowthImage.analysis_status == "completed")
        .where(AiGrowthImage.leaf_area_px.is_not(None))
        .where(AiGrowthImage.captured_at < image_row.captured_at)
        .order_by(AiGrowthImage.captured_at.desc(), AiGrowthImage.id.desc())
        .limit(1)
    )
    previous = previous_result.scalar_one_or_none()
    growth_rate = None
    created_sample = None
    message = "Image analysis completed. No previous analyzed image exists, so a camera training sample was not created."
    if previous is not None and previous.leaf_area_px and previous.leaf_area_px > 0:
        growth_rate = (leaf_area_px - previous.leaf_area_px) / previous.leaf_area_px
        growth_score = max(0.0, min(100.0, 55.0 + growth_rate * 400.0 + green_ratio * 20.0 - yellow_ratio * 30.0))
        created_sample = AiGrowthSample(
            source_type="camera",
            temperature_c=image_row.temperature_c,
            humidity_pct=image_row.humidity_pct,
            soil_moisture_pct=image_row.soil_moisture_pct,
            light_lux=image_row.light_lux,
            leaf_area_px=round(leaf_area_px, 2),
            green_ratio=round(green_ratio, 5),
            growth_rate=round(float(growth_rate), 5),
            growth_score=round(growth_score, 2),
            measured_at=image_row.captured_at,
        )
        db.add(created_sample)
        message = "Image analysis completed and one camera-based training sample was created."

    image_row.leaf_area_px = round(leaf_area_px, 2)
    image_row.green_ratio = round(green_ratio, 5)
    image_row.yellow_ratio = round(yellow_ratio, 5)
    image_row.growth_rate = round(float(growth_rate), 5) if growth_rate is not None else None
    image_row.analysis_status = "completed"
    await db.commit()
    await db.refresh(image_row)
    if created_sample is not None:
        await db.refresh(created_sample)
    return image_row, created_sample, message


async def get_status(db: AsyncSession) -> dict:
    total_samples = int(await db.scalar(select(func.count(AiGrowthSample.id))) or 0)
    mock_samples = int(
        await db.scalar(select(func.count(AiGrowthSample.id)).where(AiGrowthSample.source_type == "mock")) or 0
    )
    camera_samples = int(
        await db.scalar(select(func.count(AiGrowthSample.id)).where(AiGrowthSample.source_type == "camera")) or 0
    )
    total_images = int(await db.scalar(select(func.count(AiGrowthImage.id))) or 0)
    analyzed_images = int(
        await db.scalar(select(func.count(AiGrowthImage.id)).where(AiGrowthImage.analysis_status == "completed")) or 0
    )
    latest_model = await get_latest_training_run(db)
    return {
        "total_samples": total_samples,
        "mock_samples": mock_samples,
        "camera_samples": camera_samples,
        "total_images": total_images,
        "analyzed_images": analyzed_images,
        "latest_model": latest_model,
    }
