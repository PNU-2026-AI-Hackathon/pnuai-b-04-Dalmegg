from decimal import Decimal

import pytest

from app.services.eco import calculate_reward_points, calculate_saved_co2, quantize_eggshell_kg
from tests.helpers import register_admin_and_login, register_user_and_login


pytestmark = pytest.mark.asyncio


async def test_eco_calculator_uses_decimal_precision():
    first = quantize_eggshell_kg(Decimal("0.100"))
    second = quantize_eggshell_kg(Decimal("0.200"))

    assert first + second == Decimal("0.300")
    assert calculate_saved_co2(first + second) == Decimal("0.1110")
    assert calculate_reward_points(Decimal("0.309")) == 30


async def test_admin_can_record_eggshell_contributions_and_user_can_read_summary(client):
    admin_token = await register_admin_and_login(client, "eco-admin@example.com")
    user_token = await register_user_and_login(client, "eco-user@example.com")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    user_headers = {"Authorization": f"Bearer {user_token}"}
    me_response = await client.get("/api/auth/me", headers=user_headers)
    user_id = me_response.json()["id"]

    first_response = await client.post(
        "/api/eco/contributions",
        json={"user_id": user_id, "weight_kg": "0.100", "memo": "morning pickup"},
        headers=admin_headers,
    )
    second_response = await client.post(
        "/api/eco/contributions",
        json={"user_id": user_id, "weight_kg": "0.200"},
        headers=admin_headers,
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 201

    summary_response = await client.get("/api/eco/me/summary", headers=user_headers)
    assert summary_response.status_code == 200
    summary = summary_response.json()
    assert Decimal(summary["accumulated_eggshell_kg"]) == Decimal("0.300")
    assert Decimal(summary["saved_co2_kg"]) == Decimal("0.1110")
    assert summary["reward_points"] == 30
    assert summary["contribution_count"] == 2

    logs_response = await client.get("/api/eco/contributions", headers=user_headers)
    assert logs_response.status_code == 200
    assert len(logs_response.json()) == 2


async def test_eco_contribution_requires_positive_weight(client):
    token = await register_admin_and_login(client, "invalid-eco-admin@example.com")

    response = await client.post(
        "/api/eco/contributions",
        json={"user_id": 1, "weight_kg": "0"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 422


async def test_user_cannot_record_eggshell_contribution(client):
    token = await register_user_and_login(client, "eco-not-admin@example.com")

    response = await client.post(
        "/api/eco/contributions",
        json={"user_id": 1, "weight_kg": "0.100"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 401


async def test_admin_recording_contribution_for_missing_user_returns_404(client):
    token = await register_admin_and_login(client, "eco-missing-user-admin@example.com")

    response = await client.post(
        "/api/eco/contributions",
        json={"user_id": 999, "weight_kg": "0.100"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 404


async def test_collections_participants_and_rewards_flow(client):
    admin_token = await register_admin_and_login(client, "collection-admin@example.com")
    user_token = await register_user_and_login(client, "collection-user@example.com")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    user_headers = {"Authorization": f"Bearer {user_token}"}
    me_response = await client.get("/api/auth/me", headers=user_headers)
    user_id = me_response.json()["id"]

    collection_response = await client.post(
        "/api/collections",
        json={"user_id": user_id, "weight_kg": "1.250", "memo": "front desk collection"},
        headers=admin_headers,
    )

    assert collection_response.status_code == 201
    assert Decimal(collection_response.json()["weight_kg"]) == Decimal("1.250")
    assert collection_response.json()["reward_points"] == 125

    summary_response = await client.get("/api/collections/summary", headers=admin_headers)
    assert summary_response.status_code == 200
    summary = summary_response.json()
    assert Decimal(summary["today_weight_kg"]) == Decimal("1.250")
    assert Decimal(summary["total_weight_kg"]) == Decimal("1.250")
    assert summary["participant_count"] == 1
    assert summary["collection_count"] == 1

    trends_response = await client.get(
        "/api/collections/trends",
        params={"period": "monthly"},
        headers=admin_headers,
    )
    assert trends_response.status_code == 200
    assert Decimal(trends_response.json()[0]["weight_kg"]) == Decimal("1.250")

    rankings_response = await client.get("/api/collections/rankings", headers=admin_headers)
    assert rankings_response.status_code == 200
    assert rankings_response.json()[0]["user_id"] == user_id
    assert Decimal(rankings_response.json()[0]["total_weight_kg"]) == Decimal("1.250")

    participants_response = await client.get("/api/participants", headers=admin_headers)
    assert participants_response.status_code == 200
    assert participants_response.json()[0]["id"] == user_id

    points_response = await client.get(f"/api/participants/{user_id}/points", headers=admin_headers)
    assert points_response.status_code == 200
    assert points_response.json()["reward_points"] == 125

    reward_response = await client.post(
        f"/api/participants/{user_id}/rewards",
        json={"reward_type": "flower", "points": 25, "memo": "reward flower"},
        headers=admin_headers,
    )
    assert reward_response.status_code == 201
    assert reward_response.json()["points_used"] == 25

    updated_points_response = await client.get(f"/api/participants/{user_id}/points", headers=admin_headers)
    assert updated_points_response.json()["reward_points"] == 100


async def test_reward_redemption_rejects_insufficient_points(client):
    admin_token = await register_admin_and_login(client, "reward-admin@example.com")
    user_token = await register_user_and_login(client, "reward-user@example.com")
    me_response = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {user_token}"})
    user_id = me_response.json()["id"]

    response = await client.post(
        f"/api/participants/{user_id}/rewards",
        json={"reward_type": "flower", "points": 1},
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 409
