import pytest

from tests.helpers import create_shop_for_admin, register_and_login


pytestmark = pytest.mark.asyncio


async def test_admin_can_create_update_stock_and_query_flower(client):
    token = await register_and_login(client, "flower-admin@example.com", is_admin=True)
    shop_id = await create_shop_for_admin(client, token)
    headers = {"Authorization": f"Bearer {token}"}

    create_response = await client.post(
        "/api/flowers",
        data={
            "shop_id": shop_id,
            "name": "Rose",
            "description": "Fresh rose",
            "color": "red",
            "price": 3500,
            "stock_quantity": 7,
        },
        files={"image": ("rose.png", b"fake-image-bytes", "image/png")},
        headers=headers,
    )
    assert create_response.status_code == 201
    flower_id = create_response.json()["id"]
    assert create_response.json()["stock_quantity"] == 7
    assert create_response.json()["image_url"].startswith("/uploads/flowers/")

    stock_response = await client.patch(
        f"/api/flowers/{flower_id}/stock",
        json={"quantity": 15},
        headers=headers,
    )
    assert stock_response.status_code == 200
    assert stock_response.json()["stock_quantity"] == 15

    list_response = await client.get("/api/flowers", params={"region": "Busan"})
    assert list_response.status_code == 200
    assert list_response.json()[0]["name"] == "Rose"


async def test_create_flower_rejects_missing_shop(client):
    token = await register_and_login(client, "missing-shop-admin@example.com", is_admin=True)

    response = await client.post(
        "/api/flowers",
        data={"shop_id": 9999, "name": "Tulip", "price": 2500, "stock_quantity": 3},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 404


async def test_update_flower_image_rejects_unsupported_content_type(client):
    token = await register_and_login(client, "image-type-admin@example.com", is_admin=True)
    shop_id = await create_shop_for_admin(client, token)
    headers = {"Authorization": f"Bearer {token}"}
    create_response = await client.post(
        "/api/flowers",
        data={"shop_id": shop_id, "name": "Lily", "price": 4500, "stock_quantity": 2},
        headers=headers,
    )
    flower_id = create_response.json()["id"]

    response = await client.patch(
        f"/api/flowers/{flower_id}/image",
        files={"image": ("note.txt", b"not-image", "text/plain")},
        headers=headers,
    )

    assert response.status_code == 415
