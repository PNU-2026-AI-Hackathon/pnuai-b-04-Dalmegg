import asyncio
from datetime import datetime, timedelta, timezone

import pytest
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.db.base import Base
from app.models.admin_user import AdminUser
from app.models.shop import Shop
from app.models.user import User
from app.models.workshop_program import WorkshopProgram
from app.schemas.workshop import WorkshopBookingCreate
from app.services.workshop import create_booking_and_reserve_seats
from tests.helpers import create_shop_for_admin, register_admin_and_login, register_user_and_login


pytestmark = pytest.mark.asyncio


async def create_workshop_program(client, admin_token: str, shop_id: int, capacity: int = 6) -> int:
    response = await client.post(
        "/api/workshops/programs",
        json={
            "shop_id": shop_id,
            "title": "Flower Arrangement Basics",
            "description": "Beginner class",
            "materials": "vase, seasonal flowers",
            "starts_at": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
            "duration_minutes": 90,
            "capacity": capacity,
            "price_per_person": 25000,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 201
    return response.json()["id"]


async def test_admin_can_create_program_and_user_can_book(client):
    admin_token = await register_admin_and_login(client, "workshop-admin@example.com")
    user_token = await register_user_and_login(client, "workshop-user@example.com")
    shop_id = await create_shop_for_admin(client, admin_token)
    program_id = await create_workshop_program(client, admin_token, shop_id)

    booking_response = await client.post(
        "/api/workshops/bookings",
        json={"program_id": program_id, "participant_count": 2},
        headers={"Authorization": f"Bearer {user_token}"},
    )

    assert booking_response.status_code == 201
    assert booking_response.json()["total_amount"] == 50000

    list_response = await client.get("/api/workshops/programs", params={"shop_id": shop_id})
    assert list_response.status_code == 200
    assert list_response.json()[0]["remaining_seats"] == 4


async def test_booking_rejects_capacity_overflow(client):
    admin_token = await register_admin_and_login(client, "workshop-capacity-admin@example.com")
    user_token = await register_user_and_login(client, "workshop-capacity-user@example.com")
    shop_id = await create_shop_for_admin(client, admin_token)
    program_id = await create_workshop_program(client, admin_token, shop_id, capacity=2)

    response = await client.post(
        "/api/workshops/bookings",
        json={"program_id": program_id, "participant_count": 3},
        headers={"Authorization": f"Bearer {user_token}"},
    )

    assert response.status_code == 409


async def test_concurrent_bookings_do_not_exceed_capacity(tmp_path):
    engine = create_async_engine(
        f"sqlite+aiosqlite:///{tmp_path / 'workshops.db'}",
        connect_args={"timeout": 30},
        future=True,
    )
    SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as db:
        admin = AdminUser(email="concurrent-workshop-admin@example.com", hashed_password="x")
        user = User(email="concurrent-workshop-user@example.com", hashed_password="x")
        db.add_all([admin, user])
        await db.flush()
        shop = Shop(admin_id=admin.id, name="Dalmegg", region="Busan", address="PNU")
        db.add(shop)
        await db.flush()
        program = WorkshopProgram(
            shop_id=shop.id,
            title="One Seat Class",
            starts_at=datetime.now(timezone.utc) + timedelta(days=1),
            duration_minutes=90,
            capacity=1,
            price_per_person=25000,
        )
        db.add(program)
        await db.commit()
        user_id = user.id
        program_id = program.id

    async def book():
        async with SessionLocal() as db:
            user = await db.get(User, user_id)
            try:
                await create_booking_and_reserve_seats(
                    db,
                    user=user,
                    booking_in=WorkshopBookingCreate(program_id=program_id, participant_count=1),
                )
                return 201
            except HTTPException as exc:
                return exc.status_code

    responses = await asyncio.gather(book(), book())
    statuses = sorted(responses)

    assert statuses == [201, 409]

    async with SessionLocal() as db:
        program = await db.get(WorkshopProgram, program_id)
        assert program.capacity - program.booked_count == 0

    await engine.dispose()
