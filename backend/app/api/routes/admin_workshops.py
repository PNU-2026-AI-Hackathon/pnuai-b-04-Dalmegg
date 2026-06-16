from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.crud.shop import get_shop
from app.crud.workshop import get_workshop_booking_with_details, list_workshop_bookings_by_shop
from app.db.session import get_db
from app.models.admin_user import AdminUser
from app.models.workshop_booking import WorkshopBooking
from app.schemas.workshop import AdminWorkshopBookingRead


router = APIRouter(prefix="/admin/workshop-bookings", tags=["admin-workshop-bookings"])


def _booking_to_admin_read_dict(booking: WorkshopBooking) -> dict:
    return {
        "id": booking.id,
        "user_id": booking.user_id,
        "user_email": booking.user.email,
        "user_full_name": booking.user.full_name,
        "program_id": booking.program_id,
        "program_title": booking.program.title,
        "shop_id": booking.program.shop_id,
        "participant_count": booking.participant_count,
        "total_amount": booking.total_amount,
        "status": booking.status,
        "created_at": booking.created_at,
    }


async def _ensure_shop_owner(db: AsyncSession, shop_id: int, admin_id: int) -> None:
    shop = await get_shop(db, shop_id)
    if shop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shop not found.")
    if shop.admin_id != admin_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot read another shop's bookings.")


@router.get("", response_model=list[AdminWorkshopBookingRead])
async def list_admin_workshop_bookings_endpoint(
    shop_id: int,
    program_id: int | None = None,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    await _ensure_shop_owner(db, shop_id, current_admin.id)
    bookings = await list_workshop_bookings_by_shop(db, shop_id, program_id=program_id)
    return [_booking_to_admin_read_dict(booking) for booking in bookings]


@router.get("/{booking_id}", response_model=AdminWorkshopBookingRead)
async def read_admin_workshop_booking_endpoint(
    booking_id: int,
    shop_id: int,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    await _ensure_shop_owner(db, shop_id, current_admin.id)
    booking = await get_workshop_booking_with_details(db, booking_id)
    if booking is None or booking.program.shop_id != shop_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workshop booking not found.")
    return _booking_to_admin_read_dict(booking)
