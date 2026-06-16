import pytest

from tests.helpers import (
    create_flower_for_admin,
    create_shop_for_admin,
    register_admin_and_login,
    register_user_and_login,
)


pytestmark = pytest.mark.asyncio


async def test_admin_can_list_orders_for_owned_shop(client):
    admin_token = await register_admin_and_login(client, "admin-order-owner@example.com")
    user_token = await register_user_and_login(client, "admin-order-user@example.com")
    shop_id = await create_shop_for_admin(client, admin_token)
    flower_id = await create_flower_for_admin(client, admin_token, shop_id)

    await client.post(
        "/api/orders",
        json={"items": [{"flower_id": flower_id, "quantity": 2}]},
        headers={"Authorization": f"Bearer {user_token}"},
    )

    response = await client.get(
        "/api/admin/orders",
        params={"shop_id": shop_id},
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["user_email"] == "admin-order-user@example.com"
    assert response.json()[0]["total_amount"] == 6000
    assert response.json()[0]["items"][0]["flower_id"] == flower_id


async def test_admin_cannot_list_orders_for_another_shop_id(client):
    owner_token = await register_admin_and_login(client, "admin-order-real-owner@example.com")
    other_token = await register_admin_and_login(client, "admin-order-other@example.com")
    shop_id = await create_shop_for_admin(client, owner_token)

    response = await client.get(
        "/api/admin/orders",
        params={"shop_id": shop_id},
        headers={"Authorization": f"Bearer {other_token}"},
    )

    assert response.status_code == 403


async def test_admin_order_detail_filters_to_requested_owned_shop(client):
    first_admin_token = await register_admin_and_login(client, "admin-order-first@example.com")
    second_admin_token = await register_admin_and_login(client, "admin-order-second@example.com")
    user_token = await register_user_and_login(client, "admin-order-mixed-user@example.com")
    first_shop_id = await create_shop_for_admin(client, first_admin_token, name="First Shop")
    second_shop_id = await create_shop_for_admin(client, second_admin_token, name="Second Shop")
    first_flower_id = await create_flower_for_admin(client, first_admin_token, first_shop_id, name="Rose")
    second_flower_id = await create_flower_for_admin(client, second_admin_token, second_shop_id, name="Tulip")

    order_response = await client.post(
        "/api/orders",
        json={
            "items": [
                {"flower_id": first_flower_id, "quantity": 1},
                {"flower_id": second_flower_id, "quantity": 1},
            ]
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )
    order_id = order_response.json()["id"]

    response = await client.get(
        f"/api/admin/orders/{order_id}",
        params={"shop_id": first_shop_id},
        headers={"Authorization": f"Bearer {first_admin_token}"},
    )

    assert response.status_code == 200
    assert response.json()["total_amount"] == 3000
    assert [item["flower_id"] for item in response.json()["items"]] == [first_flower_id]

    forbidden_response = await client.get(
        f"/api/admin/orders/{order_id}",
        params={"shop_id": first_shop_id},
        headers={"Authorization": f"Bearer {second_admin_token}"},
    )
    assert forbidden_response.status_code == 403
