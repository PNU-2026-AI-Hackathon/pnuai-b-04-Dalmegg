import pytest

from tests.helpers import create_shop_for_admin, register_and_login


pytestmark = pytest.mark.asyncio


async def test_review_creation_syncs_shop_rating_and_count(client):
    admin_token = await register_and_login(client, "review-admin@example.com", is_admin=True)
    user_token = await register_and_login(client, "review-user@example.com")
    shop_id = await create_shop_for_admin(client, admin_token)

    first_response = await client.post(
        "/api/reviews",
        json={"shop_id": shop_id, "rating": 5, "content": "Excellent"},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert first_response.status_code == 201

    second_response = await client.post(
        "/api/reviews",
        json={"shop_id": shop_id, "rating": 3, "content": "Good"},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert second_response.status_code == 201

    shop_response = await client.get(f"/api/shops/{shop_id}")
    assert shop_response.status_code == 200
    assert shop_response.json()["review_count"] == 2
    assert shop_response.json()["average_rating"] == 4.0


async def test_review_rejects_missing_shop(client):
    user_token = await register_and_login(client, "missing-review-shop@example.com")

    response = await client.post(
        "/api/reviews",
        json={"shop_id": 404, "rating": 4},
        headers={"Authorization": f"Bearer {user_token}"},
    )

    assert response.status_code == 404
