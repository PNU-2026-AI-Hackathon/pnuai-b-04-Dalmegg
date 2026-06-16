import asyncio

import pytest
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.db.base import Base
from app.models.admin_user import AdminUser
from app.models.flower import Flower
from app.models.flower_stock import FlowerStock
from app.models.shop import Shop
from app.models.user import User
from app.schemas.order import OrderCreate, OrderItemCreate
from app.services.order import create_order_and_decrement_stock
from tests.helpers import (
    create_flower_for_admin,
    create_shop_for_admin,
    register_admin_and_login,
    register_user_and_login,
)


pytestmark = pytest.mark.asyncio


async def test_user_can_create_order_and_stock_is_decremented(client):
    admin_token = await register_admin_and_login(client, "order-admin@example.com")
    user_token = await register_user_and_login(client, "order-user@example.com")
    shop_id = await create_shop_for_admin(client, admin_token)
    flower_id = await create_flower_for_admin(client, admin_token, shop_id)

    response = await client.post(
        "/api/orders",
        json={"items": [{"flower_id": flower_id, "quantity": 3}]},
        headers={"Authorization": f"Bearer {user_token}"},
    )

    assert response.status_code == 201
    assert response.json()["total_amount"] == 9000
    assert response.json()["items"][0]["quantity"] == 3

    flower_response = await client.get(f"/api/flowers/{flower_id}")
    assert flower_response.json()["stock_quantity"] == 9


async def test_order_rejects_insufficient_stock(client):
    admin_token = await register_admin_and_login(client, "order-stock-admin@example.com")
    user_token = await register_user_and_login(client, "order-stock-user@example.com")
    shop_id = await create_shop_for_admin(client, admin_token)
    flower_id = await create_flower_for_admin(client, admin_token, shop_id)

    response = await client.post(
        "/api/orders",
        json={"items": [{"flower_id": flower_id, "quantity": 13}]},
        headers={"Authorization": f"Bearer {user_token}"},
    )

    assert response.status_code == 409
    flower_response = await client.get(f"/api/flowers/{flower_id}")
    assert flower_response.json()["stock_quantity"] == 12


async def test_concurrent_orders_do_not_make_stock_negative(tmp_path):
    engine = create_async_engine(
        f"sqlite+aiosqlite:///{tmp_path / 'orders.db'}",
        connect_args={"timeout": 30},
        future=True,
    )
    SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as db:
        admin = AdminUser(email="concurrent-order-admin@example.com", hashed_password="x")
        user = User(email="concurrent-order-user@example.com", hashed_password="x")
        db.add_all([admin, user])
        await db.flush()
        shop = Shop(admin_id=admin.id, name="Dalmegg", region="Busan", address="PNU")
        db.add(shop)
        await db.flush()
        flower = Flower(shop_id=shop.id, name="Rose", price=3000)
        db.add(flower)
        await db.flush()
        db.add(FlowerStock(flower_id=flower.id, quantity=1))
        await db.commit()
        user_id = user.id
        flower_id = flower.id

    async def place_order():
        async with SessionLocal() as db:
            user = await db.get(User, user_id)
            try:
                await create_order_and_decrement_stock(
                    db,
                    user=user,
                    order_in=OrderCreate(items=[OrderItemCreate(flower_id=flower_id, quantity=1)]),
                )
                return 201
            except HTTPException as exc:
                return exc.status_code

    responses = await asyncio.gather(place_order(), place_order())
    statuses = sorted(responses)

    assert statuses == [201, 409]

    async with SessionLocal() as db:
        stock = await db.get(FlowerStock, 1)
        assert stock.quantity == 0

    await engine.dispose()
