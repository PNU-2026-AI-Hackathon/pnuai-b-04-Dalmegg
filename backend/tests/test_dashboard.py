from decimal import Decimal

import pytest

from tests.helpers import create_shop_for_admin, register_admin_and_login, register_user_and_login


pytestmark = pytest.mark.asyncio


async def test_admin_can_read_dashboard_summary(client):
    admin_token = await register_admin_and_login(client, "dashboard-admin@example.com")
    user_token = await register_user_and_login(client, "dashboard-user@example.com")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    user_response = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {user_token}"})
    user_id = user_response.json()["id"]
    shop_id = await create_shop_for_admin(client, admin_token)

    await client.post(
        "/api/collections",
        json={"user_id": user_id, "weight_kg": "2.000", "memo": "dashboard collection"},
        headers=admin_headers,
    )
    await client.post(
        "/api/flowers",
        data={"shop_id": shop_id, "name": "Rose", "price": 3000, "stock_quantity": 3},
        headers=admin_headers,
    )
    await client.post(
        "/api/flowers",
        data={"shop_id": shop_id, "name": "Tulip", "price": 2500, "stock_quantity": 0},
        headers=admin_headers,
    )

    response = await client.get("/api/dashboard/summary", headers=admin_headers)

    assert response.status_code == 200
    summary = response.json()
    assert Decimal(summary["today_eggshell_kg"]) == Decimal("2.000")
    assert Decimal(summary["accumulated_circulation_kg"]) == Decimal("2.000")
    assert Decimal(summary["saved_water_liters"]) == Decimal("6.0")
    assert summary["growing_flower_count"] == 1
    assert summary["recent_alerts"] == []
    assert summary["stock_summary"]["total_flower_types"] == 2
    assert summary["stock_summary"]["total_stock_quantity"] == 3
    assert summary["stock_summary"]["low_stock_count"] == 1
    assert summary["stock_summary"]["out_of_stock_count"] == 1
    assert summary["collection_stats"][0]["collection_count"] == 1


async def test_dashboard_summary_requires_admin(client):
    token = await register_user_and_login(client, "dashboard-not-admin@example.com")

    response = await client.get("/api/dashboard/summary", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401
