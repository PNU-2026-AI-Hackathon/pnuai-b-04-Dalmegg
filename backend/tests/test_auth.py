from datetime import timedelta

import pytest

from app.core.security import create_access_token, decode_access_token, hash_password, verify_password


pytestmark = pytest.mark.asyncio


async def test_password_hashing_and_verification():
    hashed = hash_password("secure-password")

    assert hashed != "secure-password"
    assert verify_password("secure-password", hashed)
    assert not verify_password("wrong-password", hashed)


async def test_jwt_token_issue_and_decode():
    token = create_access_token("123", token_type="user", expires_delta=timedelta(minutes=5))

    assert decode_access_token(token, expected_type="user") == "123"
    assert decode_access_token(token, expected_type="admin") is None


async def test_register_login_and_me(client):
    register_response = await client.post(
        "/api/auth/register",
        json={
            "email": "owner@example.com",
            "password": "strong-password",
            "full_name": "Shop Owner",
        },
    )
    assert register_response.status_code == 201
    assert register_response.json()["email"] == "owner@example.com"

    login_response = await client.post(
        "/api/auth/login",
        json={"email": "owner@example.com", "password": "strong-password"},
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    me_response = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "owner@example.com"


async def test_admin_register_login_and_me(client):
    register_response = await client.post(
        "/api/admin/auth/register",
        json={
            "email": "admin@example.com",
            "password": "strong-password",
            "full_name": "Shop Admin",
        },
    )
    assert register_response.status_code == 201
    assert register_response.json()["email"] == "admin@example.com"

    login_response = await client.post(
        "/api/admin/auth/login",
        json={"email": "admin@example.com", "password": "strong-password"},
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    me_response = await client.get("/api/admin/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "admin@example.com"


async def test_admin_login_refresh_and_logout_from_common_auth_routes(client):
    await client.post(
        "/api/admin/auth/register",
        json={
            "email": "operator@example.com",
            "password": "strong-password",
            "full_name": "Operator",
        },
    )

    login_response = await client.post(
        "/api/auth/login",
        json={"email": "operator@example.com", "password": "strong-password"},
    )
    assert login_response.status_code == 200
    login_data = login_response.json()
    assert login_data["access_token"]
    assert login_data["refresh_token"]

    me_response = await client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {login_data['access_token']}"},
    )
    assert me_response.status_code == 200
    assert me_response.json()["role"] == "admin"
    assert me_response.json()["email"] == "operator@example.com"

    refresh_response = await client.post(
        "/api/auth/refresh",
        json={"refresh_token": login_data["refresh_token"]},
    )
    assert refresh_response.status_code == 200
    refreshed_data = refresh_response.json()
    assert refreshed_data["access_token"]
    assert refreshed_data["refresh_token"]
    assert refreshed_data["refresh_token"] != login_data["refresh_token"]

    reused_refresh_response = await client.post(
        "/api/auth/refresh",
        json={"refresh_token": login_data["refresh_token"]},
    )
    assert reused_refresh_response.status_code == 401

    logout_response = await client.post(
        "/api/auth/logout",
        headers={"Authorization": f"Bearer {refreshed_data['access_token']}"},
        json={"refresh_token": refreshed_data["refresh_token"]},
    )
    assert logout_response.status_code == 204

    revoked_me_response = await client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {refreshed_data['access_token']}"},
    )
    assert revoked_me_response.status_code == 401

    revoked_refresh_response = await client.post(
        "/api/auth/refresh",
        json={"refresh_token": refreshed_data["refresh_token"]},
    )
    assert revoked_refresh_response.status_code == 401


async def test_duplicate_email_rejected(client):
    payload = {"email": "same@example.com", "password": "strong-password"}

    assert (await client.post("/api/auth/register", json=payload)).status_code == 201
    response = await client.post("/api/auth/register", json=payload)

    assert response.status_code == 409
