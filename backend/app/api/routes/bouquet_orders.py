from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin, get_current_user
from app.crud.bouquet import (
    bouquet_order_to_admin_read_dict,
    bouquet_order_to_read_dict,
    create_bouquet_order_with_room,
    get_bouquet_order,
    list_bouquet_orders_by_shop,
    list_bouquet_orders_by_user,
)
from app.crud.shop import get_shop
from app.db.session import get_db
from app.models.admin_user import AdminUser
from app.models.user import User
from app.schemas.bouquet import AdminBouquetOrderRead, BouquetOrderCreate, BouquetOrderRead


router = APIRouter(prefix="/bouquet-orders", tags=["bouquet-orders"])
admin_router = APIRouter(prefix="/admin/bouquet-orders", tags=["admin-bouquet-orders"])


@router.post("", response_model=BouquetOrderRead, status_code=status.HTTP_201_CREATED)
async def create_bouquet_order_endpoint(
    order_in: BouquetOrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    shop = await get_shop(db, order_in.shop_id)
    if shop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shop not found.")
    order = await create_bouquet_order_with_room(
        db,
        user_id=current_user.id,
        admin_id=shop.admin_id,
        order_in=order_in,
    )
    return bouquet_order_to_read_dict(order)


@router.get("", response_model=list[BouquetOrderRead])
async def list_my_bouquet_orders_endpoint(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    orders = await list_bouquet_orders_by_user(db, current_user.id)
    return [bouquet_order_to_read_dict(order) for order in orders]


@router.get("/{order_id}", response_model=BouquetOrderRead)
async def read_my_bouquet_order_endpoint(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    order = await get_bouquet_order(db, order_id)
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bouquet order not found.")
    if order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot read another user's request.")
    return bouquet_order_to_read_dict(order)


async def _ensure_shop_owner(db: AsyncSession, shop_id: int, admin_id: int) -> None:
    shop = await get_shop(db, shop_id)
    if shop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shop not found.")
    if shop.admin_id != admin_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot read another shop's requests.")


@admin_router.get("", response_model=list[AdminBouquetOrderRead])
async def list_admin_bouquet_orders_endpoint(
    shop_id: int,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    await _ensure_shop_owner(db, shop_id, current_admin.id)
    orders = await list_bouquet_orders_by_shop(db, shop_id)
    return [bouquet_order_to_admin_read_dict(order) for order in orders]


@admin_router.get("/{order_id}", response_model=AdminBouquetOrderRead)
async def read_admin_bouquet_order_endpoint(
    order_id: int,
    shop_id: int,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    await _ensure_shop_owner(db, shop_id, current_admin.id)
    order = await get_bouquet_order(db, order_id)
    if order is None or order.shop_id != shop_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bouquet order not found.")
    return bouquet_order_to_admin_read_dict(order)
