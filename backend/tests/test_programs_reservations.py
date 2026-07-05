from datetime import datetime, timedelta, timezone

import pytest

from tests.helpers import create_shop_for_admin, register_admin_and_login, register_user_and_login


pytestmark = pytest.mark.asyncio


async def create_program_via_alias(client, admin_token: str, shop_id: int, title: str = "Flower Class") -> dict:
    starts_at = datetime.now(timezone.utc) + timedelta(days=1)
    response = await client.post(
        "/api/programs",
        json={
            "shop_id": shop_id,
            "title": title,
            "description": "Beginner flower class",
            "materials": "seasonal flowers",
            "starts_at": starts_at.isoformat(),
            "duration_minutes": 90,
            "capacity": 5,
            "price_per_person": 20000,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 201
    data = response.json()
    data["starts_at_date"] = starts_at.date().isoformat()
    return data


async def test_program_aliases_and_available_slots(client):
    admin_token = await register_admin_and_login(client, "program-alias-admin@example.com")
    shop_id = await create_shop_for_admin(client, admin_token)
    program = await create_program_via_alias(client, admin_token, shop_id)

    list_response = await client.get("/api/programs", params={"shop_id": shop_id})
    assert list_response.status_code == 200
    assert list_response.json()[0]["id"] == program["id"]

    detail_response = await client.get(f"/api/programs/{program['id']}")
    assert detail_response.status_code == 200
    assert detail_response.json()["title"] == "Flower Class"

    slots_response = await client.get(
        f"/api/programs/{program['id']}/available-slots",
        params={"date": program["starts_at_date"]},
    )
    assert slots_response.status_code == 200
    assert slots_response.json()["remaining_seats"] == 5
    assert slots_response.json()["is_available"] is True


async def test_reservation_aliases_admin_status_and_user_cancel(client):
    admin_token = await register_admin_and_login(client, "reservation-alias-admin@example.com")
    user_token = await register_user_and_login(client, "reservation-alias-user@example.com")
    shop_id = await create_shop_for_admin(client, admin_token)
    program = await create_program_via_alias(client, admin_token, shop_id, title="Reservation Class")

    booking_response = await client.post(
        "/api/reservations",
        json={"program_id": program["id"], "participant_count": 2},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert booking_response.status_code == 201
    reservation_id = booking_response.json()["id"]

    admin_list_response = await client.get(
        "/api/admin/reservations",
        params={"status": "confirmed", "q": "Reservation"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert admin_list_response.status_code == 200
    assert admin_list_response.json()[0]["id"] == reservation_id

    admin_detail_response = await client.get(
        f"/api/admin/reservations/{reservation_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert admin_detail_response.status_code == 200
    assert admin_detail_response.json()["program_title"] == "Reservation Class"

    status_response = await client.patch(
        f"/api/admin/reservations/{reservation_id}/status",
        json={"status": "reserved"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert status_response.status_code == 200
    assert status_response.json()["status"] == "reserved"

    cancel_response = await client.patch(
        f"/api/reservations/{reservation_id}/cancel",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert cancel_response.status_code == 200
    assert cancel_response.json()["status"] == "cancelled"

    slots_response = await client.get(
        f"/api/programs/{program['id']}/available-slots",
        params={"date": program["starts_at_date"]},
    )
    assert slots_response.json()["remaining_seats"] == 5
