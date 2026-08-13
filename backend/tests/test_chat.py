import pytest

from tests.helpers import create_shop_for_admin, register_admin_and_login, register_user_and_login


pytestmark = pytest.mark.asyncio


async def create_bouquet_room(client):
    admin_token = await register_admin_and_login(client, "chat-admin@example.com")
    user_token = await register_user_and_login(client, "chat-user@example.com")
    shop_id = await create_shop_for_admin(client, admin_token)
    response = await client.post(
        "/api/bouquet-orders",
        json={
            "shop_id": shop_id,
            "occasion": "proposal",
            "pickup_or_delivery": "pickup",
            "requirements": "white bouquet",
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )
    return admin_token, user_token, shop_id, response.json()["chat_room_id"]


async def test_chat_history_paging_and_unread_count(client):
    admin_token, user_token, _shop_id, room_id = await create_bouquet_room(client)

    user_headers = {"Authorization": f"Bearer {user_token}"}
    send_response = await client.post(
        f"/api/chat/rooms/{room_id}/messages",
        json={"content": "Can I use white roses?"},
        headers=user_headers,
    )
    assert send_response.status_code == 201

    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    unread_response = await client.get(f"/api/admin/chat/rooms/{room_id}/unread-count", headers=admin_headers)
    assert unread_response.status_code == 200
    assert unread_response.json()["unread_count"] == 1

    messages_response = await client.get(
        f"/api/admin/chat/rooms/{room_id}/messages",
        params={"offset": 0, "limit": 10},
        headers=admin_headers,
    )
    assert messages_response.status_code == 200
    assert messages_response.json()[0]["content"] == "Can I use white roses?"

    unread_after_read = await client.get(f"/api/admin/chat/rooms/{room_id}/unread-count", headers=admin_headers)
    assert unread_after_read.json()["unread_count"] == 0

    user_response = await client.get(f"/api/chat/rooms/{room_id}/messages", headers=user_headers)
    assert user_response.status_code == 200


async def test_user_cannot_read_another_chat_room(client):
    _admin_token, _user_token, _shop_id, room_id = await create_bouquet_room(client)
    other_user_token = await register_user_and_login(client, "chat-other-user@example.com")

    response = await client.get(
        f"/api/chat/rooms/{room_id}/messages",
        headers={"Authorization": f"Bearer {other_user_token}"},
    )

    assert response.status_code == 403
