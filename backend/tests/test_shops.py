import pytest


pytestmark = pytest.mark.asyncio


async def _admin_token(client) -> str:
    await client.post(
        "/api/auth/register",
        json={
            "email": "admin@example.com",
            "password": "strong-password",
            "is_admin": True,
        },
    )
    response = await client.post(
        "/api/auth/login",
        json={"email": "admin@example.com", "password": "strong-password"},
    )
    return response.json()["access_token"]


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
    await client.post(
        "/api/auth/register",
        json={"email": "user@example.com", "password": "strong-password"},
    )
    login_response = await client.post(
        "/api/auth/login",
        json={"email": "user@example.com", "password": "strong-password"},
    )
    token = login_response.json()["access_token"]

    response = await client.post(
        "/api/shops",
        json={"name": "Blocked", "region": "Busan", "address": "Somewhere"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 403
