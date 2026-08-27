from fastapi import HTTPException, status
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.workshop import create_workshop_booking, get_workshop_program
from app.models.user import User
from app.models.workshop_booking import WorkshopBooking
from app.models.workshop_program import WorkshopProgram
from app.schemas.workshop import WorkshopBookingCreate


SEAT_COUNTED_STATUSES = {"reserved", "confirmed"}


async def create_booking_and_reserve_seats(
    db: AsyncSession,
    *,
    user: User,
    booking_in: WorkshopBookingCreate,
) -> WorkshopBooking:
    program = await get_workshop_program(db, booking_in.program_id)
    if program is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workshop program not found.")

    try:
        result = await db.execute(
            update(WorkshopProgram)
            .where(
                WorkshopProgram.id == booking_in.program_id,
                WorkshopProgram.booked_count <= WorkshopProgram.capacity - booking_in.participant_count,
            )
            .values(booked_count=WorkshopProgram.booked_count + booking_in.participant_count)
        )
        if result.rowcount != 1:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Not enough workshop seats.")

        total_amount = program.price_per_person * booking_in.participant_count
        booking = await create_workshop_booking(
            db,
            user_id=user.id,
            program_id=program.id,
            participant_count=booking_in.participant_count,
            total_amount=total_amount,
        )
        await db.commit()
        return booking
    except Exception:
        await db.rollback()
        raise


async def update_booking_status_and_seats(
    db: AsyncSession,
    *,
    booking: WorkshopBooking,
    new_status: str,
) -> WorkshopBooking:
    old_status = booking.status
    if old_status == new_status:
        return booking

    old_counts_seats = old_status in SEAT_COUNTED_STATUSES
    new_counts_seats = new_status in SEAT_COUNTED_STATUSES

    try:
        if old_counts_seats and not new_counts_seats:
            await db.execute(
                update(WorkshopProgram)
                .where(WorkshopProgram.id == booking.program_id)
                .values(booked_count=WorkshopProgram.booked_count - booking.participant_count)
            )
        elif not old_counts_seats and new_counts_seats:
            result = await db.execute(
                update(WorkshopProgram)
                .where(
                    WorkshopProgram.id == booking.program_id,
                    WorkshopProgram.booked_count <= WorkshopProgram.capacity - booking.participant_count,
                )
                .values(booked_count=WorkshopProgram.booked_count + booking.participant_count)
            )
            if result.rowcount != 1:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Not enough workshop seats.")

        booking.status = new_status
        await db.commit()
        await db.refresh(booking)
        return booking
    except Exception:
        await db.rollback()
        raise
