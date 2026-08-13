from datetime import datetime, timedelta, timezone

import pytest

from tests.helpers import create_shop_for_admin, register_admin_and_login, register_user_and_login


pytestmark = pytest.mark.asyncio


async def create_program(client, admin_token: str, shop_id: int, title: str = "Flower Class") -> int:
    response = await client.post(
        "/api/workshops/programs",
        json={
            "shop_id": shop_id,
            "title": title,
            "starts_at": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
            "duration_minutes": 90,
            "capacity": 10,
            "price_per_person": 20000,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 201
    return response.json()["id"]


async def test_admin_can_list_workshop_bookings_for_owned_shop_with_user_info(client):
    admin_token = await register_admin_and_login(client, "booking-admin@example.com")
    user_token = await register_user_and_login(client, "booking-user@example.com")
    shop_id = await create_shop_for_admin(client, admin_token)
    program_id = await create_program(client, admin_token, shop_id)

    booking_response = await client.post(
        "/api/workshops/bookings",
        json={"program_id": program_id, "participant_count": 2},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert booking_response.status_code == 201

    response = await client.get(
        "/api/admin/workshop-bookings",
        params={"shop_id": shop_id},
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 200
    assert len(response.json()) == 1
    booking = response.json()[0]
    assert booking["user_email"] == "booking-user@example.com"
    assert booking["program_id"] == program_id
    assert booking["program_title"] == "Flower Class"
    assert booking["participant_count"] == 2
    assert booking["total_amount"] == 40000


async def test_admin_cannot_read_workshop_bookings_for_another_shop_id(client):
    owner_token = await register_admin_and_login(client, "booking-owner@example.com")
    other_token = await register_admin_and_login(client, "booking-other@example.com")
    shop_id = await create_shop_for_admin(client, owner_token)

    response = await client.get(
        "/api/admin/workshop-bookings",
        params={"shop_id": shop_id},
        headers={"Authorization": f"Bearer {other_token}"},
    )

    assert response.status_code == 403


async def test_admin_can_filter_and_read_workshop_booking_detail(client):
    admin_token = await register_admin_and_login(client, "booking-detail-admin@example.com")
    user_token = await register_user_and_login(client, "booking-detail-user@example.com")
    shop_id = await create_shop_for_admin(client, admin_token)
    first_program_id = await create_program(client, admin_token, shop_id, title="First Class")
    second_program_id = await create_program(client, admin_token, shop_id, title="Second Class")

    first_booking = await client.post(
        "/api/workshops/bookings",
        json={"program_id": first_program_id, "participant_count": 1},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    await client.post(
        "/api/workshops/bookings",
        json={"program_id": second_program_id, "participant_count": 1},
        headers={"Authorization": f"Bearer {user_token}"},
    )

    filtered_response = await client.get(
        "/api/admin/workshop-bookings",
        params={"shop_id": shop_id, "program_id": first_program_id},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert filtered_response.status_code == 200
    assert [booking["program_id"] for booking in filtered_response.json()] == [first_program_id]

    detail_response = await client.get(
        f"/api/admin/workshop-bookings/{first_booking.json()['id']}",
        params={"shop_id": shop_id},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert detail_response.status_code == 200
    assert detail_response.json()["program_title"] == "First Class"
