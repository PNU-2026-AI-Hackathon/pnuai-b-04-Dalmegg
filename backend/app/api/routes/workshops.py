from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin, get_current_user
from app.crud.shop import get_shop
from app.crud.workshop import (
    create_workshop_program,
    list_workshop_programs,
    workshop_program_to_read_dict,
)
from app.db.session import get_db
from app.models.admin_user import AdminUser
from app.models.user import User
from app.schemas.workshop import (
    WorkshopBookingCreate,
    WorkshopBookingRead,
    WorkshopProgramCreate,
    WorkshopProgramRead,
)
from app.services.workshop import create_booking_and_reserve_seats


router = APIRouter(prefix="/workshops", tags=["workshops"])


@router.post("/programs", response_model=WorkshopProgramRead, status_code=status.HTTP_201_CREATED)
async def create_workshop_program_endpoint(
    program_in: WorkshopProgramCreate,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    shop = await get_shop(db, program_in.shop_id)
    if shop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shop not found.")
    if shop.admin_id != current_admin.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot manage another shop.")
    program = await create_workshop_program(db, program_in)
    return workshop_program_to_read_dict(program)


@router.get("/programs", response_model=list[WorkshopProgramRead])
async def list_workshop_programs_endpoint(
    shop_id: int | None = None,
    db: AsyncSession = Depends(get_db),
):
    programs = await list_workshop_programs(db, shop_id=shop_id)
    return [workshop_program_to_read_dict(program) for program in programs]


@router.post("/bookings", response_model=WorkshopBookingRead, status_code=status.HTTP_201_CREATED)
async def create_workshop_booking_endpoint(
    booking_in: WorkshopBookingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await create_booking_and_reserve_seats(db, user=current_user, booking_in=booking_in)
