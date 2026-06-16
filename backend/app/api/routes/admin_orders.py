from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.crud.order import get_order_with_items, list_orders_by_shop
from app.crud.shop import get_shop
from app.db.session import get_db
from app.models.admin_user import AdminUser
from app.models.order import Order
from app.models.order_item import OrderItem
from app.schemas.order import OrderRead


router = APIRouter(prefix="/admin/orders", tags=["admin-orders"])


def _order_to_shop_order_dict(order: Order, shop_id: int) -> dict:
    items: list[OrderItem] = [item for item in order.items if item.flower and item.flower.shop_id == shop_id]
    return {
        "id": order.id,
        "user_id": order.user_id,
        "total_amount": sum(item.line_amount for item in items),
        "status": order.status,
        "created_at": order.created_at,
        "items": items,
    }


async def _ensure_shop_owner(db: AsyncSession, shop_id: int, admin_id: int) -> None:
    shop = await get_shop(db, shop_id)
    if shop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shop not found.")
    if shop.admin_id != admin_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot read another shop's orders.")


@router.get("", response_model=list[OrderRead])
async def list_admin_shop_orders_endpoint(
    shop_id: int,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    await _ensure_shop_owner(db, shop_id, current_admin.id)
    orders = await list_orders_by_shop(db, shop_id)
    return [_order_to_shop_order_dict(order, shop_id) for order in orders]


@router.get("/{order_id}", response_model=OrderRead)
async def read_admin_shop_order_endpoint(
    order_id: int,
    shop_id: int,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    await _ensure_shop_owner(db, shop_id, current_admin.id)
    order = await get_order_with_items(db, order_id)
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

    filtered = _order_to_shop_order_dict(order, shop_id)
    if not filtered["items"]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    return filtered
