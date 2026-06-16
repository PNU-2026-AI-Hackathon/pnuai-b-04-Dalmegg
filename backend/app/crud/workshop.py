from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.workshop_booking import WorkshopBooking
from app.models.workshop_program import WorkshopProgram
from app.schemas.workshop import WorkshopProgramCreate


def workshop_program_to_read_dict(program: WorkshopProgram) -> dict:
    return {
        "id": program.id,
        "shop_id": program.shop_id,
        "title": program.title,
        "description": program.description,
        "materials": program.materials,
        "starts_at": program.starts_at,
        "duration_minutes": program.duration_minutes,
        "capacity": program.capacity,
        "booked_count": program.booked_count,
        "remaining_seats": program.capacity - program.booked_count,
        "price_per_person": program.price_per_person,
    }


async def create_workshop_program(
    db: AsyncSession,
    program_in: WorkshopProgramCreate,
) -> WorkshopProgram:
    program = WorkshopProgram(**program_in.model_dump())
    db.add(program)
    await db.commit()
    await db.refresh(program)
    return program


async def get_workshop_program(db: AsyncSession, program_id: int) -> WorkshopProgram | None:
    result = await db.execute(select(WorkshopProgram).where(WorkshopProgram.id == program_id))
    return result.scalar_one_or_none()


async def list_workshop_programs(db: AsyncSession, shop_id: int | None = None) -> list[WorkshopProgram]:
    stmt = select(WorkshopProgram).order_by(WorkshopProgram.starts_at, WorkshopProgram.id)
    if shop_id is not None:
        stmt = stmt.where(WorkshopProgram.shop_id == shop_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def create_workshop_booking(
    db: AsyncSession,
    *,
    user_id: int,
    program_id: int,
    participant_count: int,
    total_amount: float,
) -> WorkshopBooking:
    booking = WorkshopBooking(
        user_id=user_id,
        program_id=program_id,
        participant_count=participant_count,
        total_amount=total_amount,
    )
    db.add(booking)
    await db.flush()
    return booking


async def list_workshop_bookings_by_shop(
    db: AsyncSession,
    shop_id: int,
    *,
    program_id: int | None = None,
) -> list[WorkshopBooking]:
    stmt = (
        select(WorkshopBooking)
        .join(WorkshopBooking.program)
        .options(selectinload(WorkshopBooking.program), selectinload(WorkshopBooking.user))
        .where(WorkshopProgram.shop_id == shop_id)
        .order_by(WorkshopBooking.id.desc())
    )
    if program_id is not None:
        stmt = stmt.where(WorkshopBooking.program_id == program_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_workshop_booking_with_details(
    db: AsyncSession,
    booking_id: int,
) -> WorkshopBooking | None:
    result = await db.execute(
        select(WorkshopBooking)
        .options(selectinload(WorkshopBooking.program), selectinload(WorkshopBooking.user))
        .where(WorkshopBooking.id == booking_id)
    )
    return result.scalar_one_or_none()


async def list_workshop_bookings_by_user(db: AsyncSession, user_id: int) -> list[WorkshopBooking]:
    result = await db.execute(
        select(WorkshopBooking)
        .options(selectinload(WorkshopBooking.program), selectinload(WorkshopBooking.user))
        .where(WorkshopBooking.user_id == user_id)
        .order_by(WorkshopBooking.id.desc())
    )
    return list(result.scalars().all())


async def get_workshop_booking_by_user(
    db: AsyncSession,
    booking_id: int,
    user_id: int,
) -> WorkshopBooking | None:
    result = await db.execute(
        select(WorkshopBooking)
        .options(selectinload(WorkshopBooking.program), selectinload(WorkshopBooking.user))
        .where(WorkshopBooking.id == booking_id, WorkshopBooking.user_id == user_id)
    )
    return result.scalar_one_or_none()
