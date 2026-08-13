import pytest

from tests.helpers import register_admin_and_login, register_user_and_login

pytestmark = pytest.mark.asyncio


async def _admin_token(client) -> str:
    return await register_admin_and_login(client, "admin@example.com")


async def test_admin_can_create_update_and_list_shop(client):
    token = await _admin_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    create_response = await client.post(
        "/api/shops",
        json={
            "name": "Dalmegg Flower",
            "region": "Busan",
            "address": "Busan National University",
            "phone": "051-000-0000",
        },
        headers=headers,
    )
    assert create_response.status_code == 201
    shop_id = create_response.json()["id"]

    update_response = await client.patch(
        f"/api/shops/{shop_id}",
        json={"description": "Circular smart flower farm shop"},
        headers=headers,
    )
    assert update_response.status_code == 200
    assert update_response.json()["description"] == "Circular smart flower farm shop"

    list_response = await client.get("/api/shops", params={"region": "Busan"})
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1


async def test_non_admin_cannot_create_shop(client):
    token = await register_user_and_login(client, "user@example.com")

    response = await client.post(
        "/api/shops",
        json={"name": "Blocked", "region": "Busan", "address": "Somewhere"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 401
