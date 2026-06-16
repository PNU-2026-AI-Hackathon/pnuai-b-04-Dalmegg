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
