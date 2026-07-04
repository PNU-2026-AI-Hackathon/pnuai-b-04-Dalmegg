from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.crud.flower import (
    create_stock_adjustment,
    create_flower,
    delete_flower,
    flower_to_read_dict,
    get_flower,
    list_stock_adjustments,
    list_flowers,
    update_flower,
    update_flower_image,
    update_stock,
)
from app.crud.shop import get_shop
from app.db.session import get_db
from app.models.admin_user import AdminUser
from app.schemas.flower import (
    FlowerCreate,
    FlowerRead,
    FlowerUpdate,
    StockAdjustmentCreate,
    StockAdjustmentRead,
    StockUpdate,
)
from app.services.file_storage import save_flower_image


router = APIRouter(prefix="/flowers", tags=["flowers"])


async def _get_owned_flower(db: AsyncSession, flower_id: int, admin_id: int):
    flower = await get_flower(db, flower_id)
    if flower is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Flower not found.")
    if flower.shop.admin_id != admin_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot manage another shop.")
    return flower


@router.post("", response_model=FlowerRead, status_code=status.HTTP_201_CREATED)
async def create_flower_endpoint(
    shop_id: int = Form(...),
    name: str = Form(...),
    price: float = Form(...),
    stock_quantity: int = Form(0),
    description: str | None = Form(None),
    color: str | None = Form(None),
    image: UploadFile | None = File(None),
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    flower_in = FlowerCreate(
        shop_id=shop_id,
        name=name,
        description=description,
        color=color,
        price=price,
        stock_quantity=stock_quantity,
    )
    shop = await get_shop(db, flower_in.shop_id)
    if shop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shop not found.")
    if shop.admin_id != current_admin.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot manage another shop.")

    image_url = await save_flower_image(image)
    flower = await create_flower(db, flower_in, image_url=image_url)
    return flower_to_read_dict(flower)


@router.get("", response_model=list[FlowerRead])
async def list_flower_endpoint(
    shop_id: int | None = None,
    region: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    flowers = await list_flowers(db, shop_id=shop_id, region=region)
    return [flower_to_read_dict(flower) for flower in flowers]


@router.get("/{flower_id}", response_model=FlowerRead)
async def read_flower_endpoint(flower_id: int, db: AsyncSession = Depends(get_db)):
    flower = await get_flower(db, flower_id)
    if flower is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Flower not found.")
    return flower_to_read_dict(flower)


@router.patch("/{flower_id}", response_model=FlowerRead)
async def update_flower_endpoint(
    flower_id: int,
    flower_in: FlowerUpdate,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    flower = await _get_owned_flower(db, flower_id, current_admin.id)

    updated = await update_flower(db, flower, flower_in)
    return flower_to_read_dict(updated)


@router.delete("/{flower_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_flower_endpoint(
    flower_id: int,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    flower = await _get_owned_flower(db, flower_id, current_admin.id)
    await delete_flower(db, flower)


@router.patch("/{flower_id}/stock", response_model=FlowerRead)
async def update_stock_endpoint(
    flower_id: int,
    stock_in: StockUpdate,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    flower = await _get_owned_flower(db, flower_id, current_admin.id)

    updated = await update_stock(db, flower, stock_in)
    return flower_to_read_dict(updated)


@router.post(
    "/{flower_id}/stock-adjustments",
    response_model=StockAdjustmentRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_stock_adjustment_endpoint(
    flower_id: int,
    adjustment_in: StockAdjustmentCreate,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    flower = await _get_owned_flower(db, flower_id, current_admin.id)
    try:
        return await create_stock_adjustment(
            db,
            flower=flower,
            adjustment_in=adjustment_in,
            admin_id=current_admin.id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.get("/{flower_id}/stock-adjustments", response_model=list[StockAdjustmentRead])
async def list_stock_adjustments_endpoint(
    flower_id: int,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    await _get_owned_flower(db, flower_id, current_admin.id)
    return await list_stock_adjustments(db, flower_id)


@router.patch("/{flower_id}/image", response_model=FlowerRead)
async def update_flower_image_endpoint(
    flower_id: int,
    image: UploadFile = File(...),
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    flower = await _get_owned_flower(db, flower_id, current_admin.id)

    image_url = await save_flower_image(image)
    updated = await update_flower_image(db, flower, image_url)
    return flower_to_read_dict(updated)
