import pytest

from tests.helpers import create_shop_for_admin, register_admin_and_login, register_user_and_login


pytestmark = pytest.mark.asyncio


async def test_user_can_submit_custom_bouquet_form_and_chat_room_is_created(client):
    admin_token = await register_admin_and_login(client, "bouquet-admin@example.com")
    user_token = await register_user_and_login(client, "bouquet-user@example.com")
    shop_id = await create_shop_for_admin(client, admin_token)

    response = await client.post(
        "/api/bouquet-orders",
        json={
            "shop_id": shop_id,
            "occasion": "birthday",
            "recipient": "friend",
            "preferred_colors": "pink, white",
            "budget_min": 30000,
            "budget_max": 50000,
            "pickup_or_delivery": "pickup",
            "message_card": "happy birthday",
            "requirements": "soft mood bouquet",
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["shop_id"] == shop_id
    assert body["chat_room_id"] > 0

    user_rooms = await client.get("/api/chat/rooms", headers={"Authorization": f"Bearer {user_token}"})
    assert user_rooms.status_code == 200
    assert user_rooms.json()[0]["id"] == body["chat_room_id"]

    admin_orders = await client.get(
        "/api/admin/bouquet-orders",
        params={"shop_id": shop_id},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert admin_orders.status_code == 200
    assert admin_orders.json()[0]["user_email"] == "bouquet-user@example.com"


async def test_bouquet_form_rejects_invalid_budget_range(client):
    admin_token = await register_admin_and_login(client, "bouquet-budget-admin@example.com")
    user_token = await register_user_and_login(client, "bouquet-budget-user@example.com")
    shop_id = await create_shop_for_admin(client, admin_token)

    response = await client.post(
        "/api/bouquet-orders",
        json={
            "shop_id": shop_id,
            "occasion": "anniversary",
            "budget_min": 60000,
            "budget_max": 50000,
            "pickup_or_delivery": "delivery",
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )

    assert response.status_code == 422


async def test_admin_cannot_read_another_shop_bouquet_orders(client):
    owner_token = await register_admin_and_login(client, "bouquet-owner@example.com")
    other_token = await register_admin_and_login(client, "bouquet-other@example.com")
    shop_id = await create_shop_for_admin(client, owner_token)

    response = await client.get(
        "/api/admin/bouquet-orders",
        params={"shop_id": shop_id},
        headers={"Authorization": f"Bearer {other_token}"},
    )

    assert response.status_code == 403
