import pytest

from tests.helpers import create_flower_for_admin, create_shop_for_admin, register_and_login


pytestmark = pytest.mark.asyncio


async def test_user_can_create_list_and_delete_favorite(client):
    admin_token = await register_and_login(client, "favorite-admin@example.com", is_admin=True)
    user_token = await register_and_login(client, "favorite-user@example.com")
    shop_id = await create_shop_for_admin(client, admin_token)
    flower_id = await create_flower_for_admin(client, admin_token, shop_id)
    headers = {"Authorization": f"Bearer {user_token}"}

    create_response = await client.post("/api/favorites", json={"flower_id": flower_id}, headers=headers)
    assert create_response.status_code == 201

    list_response = await client.get("/api/favorites", headers=headers)
    assert list_response.status_code == 200
    assert list_response.json()[0]["id"] == flower_id

    delete_response = await client.delete(f"/api/favorites/{flower_id}", headers=headers)
    assert delete_response.status_code == 204


async def test_duplicate_favorite_is_rejected(client):
    admin_token = await register_and_login(client, "duplicate-favorite-admin@example.com", is_admin=True)
    user_token = await register_and_login(client, "duplicate-favorite-user@example.com")
    shop_id = await create_shop_for_admin(client, admin_token)
    flower_id = await create_flower_for_admin(client, admin_token, shop_id)
    headers = {"Authorization": f"Bearer {user_token}"}

    assert (await client.post("/api/favorites", json={"flower_id": flower_id}, headers=headers)).status_code == 201
    response = await client.post("/api/favorites", json={"flower_id": flower_id}, headers=headers)

    assert response.status_code == 409
