from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.crud.shop import create_shop, get_shop, list_shops, update_shop
from app.db.session import get_db
from app.models.admin_user import AdminUser
from app.schemas.shop import ShopCreate, ShopRead, ShopUpdate


router = APIRouter(prefix="/shops", tags=["shops"])


@router.post("", response_model=ShopRead, status_code=status.HTTP_201_CREATED)
async def create_shop_endpoint(
    shop_in: ShopCreate,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    return await create_shop(db, shop_in, admin_id=current_admin.id)


@router.get("", response_model=list[ShopRead])
async def list_shop_endpoint(region: str | None = None, db: AsyncSession = Depends(get_db)):
    return await list_shops(db, region=region)


@router.get("/{shop_id}", response_model=ShopRead)
async def read_shop_endpoint(shop_id: int, db: AsyncSession = Depends(get_db)):
    shop = await get_shop(db, shop_id)
    if shop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shop not found.")
    return shop


@router.patch("/{shop_id}", response_model=ShopRead)
async def update_shop_endpoint(
    shop_id: int,
    shop_in: ShopUpdate,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    shop = await get_shop(db, shop_id)
    if shop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shop not found.")
    if shop.admin_id != current_admin.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot update another shop.")
    return await update_shop(db, shop, shop_in)
