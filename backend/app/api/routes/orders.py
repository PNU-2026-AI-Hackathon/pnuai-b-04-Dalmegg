from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.crud.order import get_order, list_orders_by_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.order import OrderCreate, OrderRead
from app.services.order import create_order_and_decrement_stock


router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
async def create_order_endpoint(
    order_in: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await create_order_and_decrement_stock(db, user=current_user, order_in=order_in)


@router.get("", response_model=list[OrderRead])
async def list_my_orders_endpoint(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await list_orders_by_user(db, current_user.id)


@router.get("/{order_id}", response_model=OrderRead)
async def read_order_endpoint(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    order = await get_order(db, order_id)
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    if order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot read another user's order.")
    return order
