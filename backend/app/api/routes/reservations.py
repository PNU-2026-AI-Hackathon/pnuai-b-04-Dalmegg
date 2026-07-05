from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin, get_current_user
from app.crud.shop import get_shop
from app.crud.workshop import (
    get_workshop_booking_by_user,
    get_workshop_booking_with_details,
    list_workshop_bookings_by_user,
    list_workshop_bookings_for_admin,
)
from app.db.session import get_db
from app.models.admin_user import AdminUser
from app.models.user import User
from app.models.workshop_booking import WorkshopBooking
from app.schemas.workshop import (
    AdminWorkshopBookingRead,
    WorkshopBookingCreate,
    WorkshopBookingRead,
    WorkshopBookingStatusUpdate,
)
from app.services.workshop import create_booking_and_reserve_seats, update_booking_status_and_seats


router = APIRouter(prefix="/reservations", tags=["reservations"])
admin_router = APIRouter(prefix="/admin/reservations", tags=["admin-reservations"])


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


async def _ensure_admin_booking(db: AsyncSession, booking_id: int, admin_id: int) -> WorkshopBooking:
    booking = await get_workshop_booking_with_details(db, booking_id)
    if booking is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found.")
    shop = await get_shop(db, booking.program.shop_id)
    if shop is None or shop.admin_id != admin_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot manage another shop's reservation.")
    return booking


@router.post("", response_model=WorkshopBookingRead, status_code=status.HTTP_201_CREATED)
async def create_reservation_endpoint(
    booking_in: WorkshopBookingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await create_booking_and_reserve_seats(db, user=current_user, booking_in=booking_in)


@router.get("", response_model=list[WorkshopBookingRead])
async def list_my_reservations_endpoint(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await list_workshop_bookings_by_user(db, current_user.id)


@router.patch("/{reservation_id}/cancel", response_model=WorkshopBookingRead)
async def cancel_my_reservation_endpoint(
    reservation_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    booking = await get_workshop_booking_by_user(db, reservation_id, current_user.id)
    if booking is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found.")
    return await update_booking_status_and_seats(db, booking=booking, new_status="cancelled")


@admin_router.get("", response_model=list[AdminWorkshopBookingRead])
async def list_admin_reservations_endpoint(
    shop_id: int | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    q: str | None = None,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    bookings = await list_workshop_bookings_for_admin(
        db,
        current_admin.id,
        shop_id=shop_id,
        status=status_filter,
        q=q,
    )
    return [_booking_to_admin_read_dict(booking) for booking in bookings]


@admin_router.get("/{reservation_id}", response_model=AdminWorkshopBookingRead)
async def read_admin_reservation_endpoint(
    reservation_id: int,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    booking = await _ensure_admin_booking(db, reservation_id, current_admin.id)
    return _booking_to_admin_read_dict(booking)


@admin_router.patch("/{reservation_id}/status", response_model=AdminWorkshopBookingRead)
async def update_admin_reservation_status_endpoint(
    reservation_id: int,
    status_in: WorkshopBookingStatusUpdate,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    booking = await _ensure_admin_booking(db, reservation_id, current_admin.id)
    updated = await update_booking_status_and_seats(db, booking=booking, new_status=status_in.status)
    refreshed = await get_workshop_booking_with_details(db, updated.id)
    return _booking_to_admin_read_dict(refreshed)
