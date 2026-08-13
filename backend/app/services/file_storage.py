from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

from app.core.config import get_settings


ALLOWED_IMAGE_CONTENT_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}


async def save_flower_image(image: UploadFile | None) -> str | None:
    if image is None:
        return None
    if image.content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only JPEG, PNG, and WebP images are supported.",
        )

    settings = get_settings()
    flower_dir = Path(settings.upload_dir) / "flowers"
    flower_dir.mkdir(parents=True, exist_ok=True)

    suffix = ALLOWED_IMAGE_CONTENT_TYPES[image.content_type]
    filename = f"{uuid4().hex}{suffix}"
    destination = flower_dir / filename
    destination.write_bytes(await image.read())

    return f"/uploads/flowers/{filename}"
