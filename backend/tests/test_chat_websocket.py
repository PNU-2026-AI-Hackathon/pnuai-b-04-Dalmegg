import asyncio

from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.db.base import Base
from app.db.session import get_db
from app.main import create_app


def test_websocket_chat_sends_message_and_marks_read(tmp_path):
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'chat-ws.db'}", future=True)
    SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

    async def create_tables():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    asyncio.run(create_tables())

    async def override_get_db():
        async with SessionLocal() as session:
            yield session

    app = create_app()
    app.dependency_overrides[get_db] = override_get_db

    client = TestClient(app)
    try:
        admin_register = client.post(
            "/api/admin/auth/register",
            json={"email": "ws-admin@example.com", "password": "strong-password"},
        )
        assert admin_register.status_code == 201
        admin_token = client.post(
            "/api/admin/auth/login",
            json={"email": "ws-admin@example.com", "password": "strong-password"},
        ).json()["access_token"]

        user_register = client.post(
            "/api/auth/register",
            json={"email": "ws-user@example.com", "password": "strong-password"},
        )
        assert user_register.status_code == 201
        user_token = client.post(
            "/api/auth/login",
            json={"email": "ws-user@example.com", "password": "strong-password"},
        ).json()["access_token"]

        shop_id = client.post(
            "/api/shops",
            json={"name": "WebSocket Shop", "region": "Busan", "address": "PNU"},
            headers={"Authorization": f"Bearer {admin_token}"},
        ).json()["id"]

        room_id = client.post(
            "/api/bouquet-orders",
            json={
                "shop_id": shop_id,
                "occasion": "wedding",
                "pickup_or_delivery": "pickup",
                "requirements": "pastel bouquet",
            },
            headers={"Authorization": f"Bearer {user_token}"},
        ).json()["chat_room_id"]

        with client.websocket_connect(f"/api/chat/ws/{room_id}?role=user&token={user_token}") as user_ws:
            with client.websocket_connect(f"/api/chat/ws/{room_id}?role=admin&token={admin_token}") as admin_ws:
                user_ws.send_text("Can we use pastel roses?")
                user_payload = user_ws.receive_json()
                admin_payload = admin_ws.receive_json()

        assert user_payload["content"] == "Can we use pastel roses?"
        assert admin_payload["content"] == "Can we use pastel roses?"
        assert admin_payload["is_read"] is True

        messages = client.get(
            f"/api/admin/chat/rooms/{room_id}/messages",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert messages.status_code == 200
        assert messages.json()[0]["is_read"] is True
    finally:
        client.close()

    asyncio.run(engine.dispose())
