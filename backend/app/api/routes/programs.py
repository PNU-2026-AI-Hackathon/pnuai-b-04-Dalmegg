from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.crud.shop import get_shop
from app.crud.workshop import (
    create_workshop_program,
    get_workshop_program,
    list_workshop_programs,
    workshop_program_to_read_dict,
)
from app.db.session import get_db
from app.models.admin_user import AdminUser
from app.schemas.workshop import (
    WorkshopAvailableSlotRead,
    WorkshopProgramCreate,
    WorkshopProgramRead,
)


router = APIRouter(prefix="/programs", tags=["programs"])


@router.post("", response_model=WorkshopProgramRead, status_code=status.HTTP_201_CREATED)
async def create_program_endpoint(
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


@router.get("", response_model=list[WorkshopProgramRead])
async def list_programs_endpoint(
    shop_id: int | None = None,
    db: AsyncSession = Depends(get_db),
):
    programs = await list_workshop_programs(db, shop_id=shop_id)
    return [workshop_program_to_read_dict(program) for program in programs]


@router.get("/{program_id}/available-slots", response_model=WorkshopAvailableSlotRead)
async def read_program_available_slots_endpoint(
    program_id: int,
    date: date,
    db: AsyncSession = Depends(get_db),
):
    program = await get_workshop_program(db, program_id)
    if program is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found.")

    remaining_seats = program.capacity - program.booked_count
    is_same_date = program.starts_at.date() == date
    return {
        "program_id": program.id,
        "starts_at": program.starts_at,
        "capacity": program.capacity,
        "booked_count": program.booked_count,
        "remaining_seats": remaining_seats if is_same_date else 0,
        "is_available": is_same_date and remaining_seats > 0,
    }


@router.get("/{program_id}", response_model=WorkshopProgramRead)
async def read_program_endpoint(program_id: int, db: AsyncSession = Depends(get_db)):
    program = await get_workshop_program(db, program_id)
    if program is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found.")
    return workshop_program_to_read_dict(program)
