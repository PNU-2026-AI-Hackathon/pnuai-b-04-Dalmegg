import pytest

from tests.helpers import create_shop_for_admin, register_admin_and_login


pytestmark = pytest.mark.asyncio


async def test_admin_can_create_update_stock_and_query_flower(client):
    token = await register_admin_and_login(client, "flower-admin@example.com")
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


async def test_admin_can_adjust_stock_and_read_adjustment_logs(client):
    token = await register_admin_and_login(client, "stock-adjust-admin@example.com")
    shop_id = await create_shop_for_admin(client, token)
    headers = {"Authorization": f"Bearer {token}"}
    create_response = await client.post(
        "/api/flowers",
        data={"shop_id": shop_id, "name": "Stock Rose", "price": 3000, "stock_quantity": 5},
        headers=headers,
    )
    flower_id = create_response.json()["id"]

    adjust_response = await client.post(
        f"/api/flowers/{flower_id}/stock-adjustments",
        json={"change_quantity": 4, "reason": "harvest", "memo": "First harvest"},
        headers=headers,
    )

    assert adjust_response.status_code == 201
    assert adjust_response.json()["change_quantity"] == 4
    assert adjust_response.json()["quantity_after"] == 9
    assert adjust_response.json()["reason"] == "harvest"

    flower_response = await client.get(f"/api/flowers/{flower_id}")
    assert flower_response.status_code == 200
    assert flower_response.json()["stock_quantity"] == 9

    logs_response = await client.get(f"/api/flowers/{flower_id}/stock-adjustments", headers=headers)
    assert logs_response.status_code == 200
    assert logs_response.json()[0]["memo"] == "First harvest"


async def test_stock_adjustment_rejects_negative_result(client):
    token = await register_admin_and_login(client, "negative-stock-admin@example.com")
    shop_id = await create_shop_for_admin(client, token)
    headers = {"Authorization": f"Bearer {token}"}
    create_response = await client.post(
        "/api/flowers",
        data={"shop_id": shop_id, "name": "Small Stock", "price": 3000, "stock_quantity": 2},
        headers=headers,
    )
    flower_id = create_response.json()["id"]

    response = await client.post(
        f"/api/flowers/{flower_id}/stock-adjustments",
        json={"change_quantity": -3, "reason": "discard"},
        headers=headers,
    )

    assert response.status_code == 409


async def test_admin_can_delete_flower(client):
    token = await register_admin_and_login(client, "delete-flower-admin@example.com")
    shop_id = await create_shop_for_admin(client, token)
    headers = {"Authorization": f"Bearer {token}"}
    create_response = await client.post(
        "/api/flowers",
        data={"shop_id": shop_id, "name": "Delete Me", "price": 3000, "stock_quantity": 2},
        headers=headers,
    )
    flower_id = create_response.json()["id"]

    delete_response = await client.delete(f"/api/flowers/{flower_id}", headers=headers)

    assert delete_response.status_code == 204
    read_response = await client.get(f"/api/flowers/{flower_id}")
    assert read_response.status_code == 404


async def test_create_flower_rejects_missing_shop(client):
    token = await register_admin_and_login(client, "missing-shop-admin@example.com")

    response = await client.post(
        "/api/flowers",
        data={"shop_id": 9999, "name": "Tulip", "price": 2500, "stock_quantity": 3},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 404


async def test_update_flower_image_rejects_unsupported_content_type(client):
    token = await register_admin_and_login(client, "image-type-admin@example.com")
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
