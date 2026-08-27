async def register_user_and_login(client, email: str, password: str = "strong-password") -> str:
    await client.post(
        "/api/auth/register",
        json={"email": email, "password": password},
    )
    response = await client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    return response.json()["access_token"]


async def register_admin_and_login(client, email: str, password: str = "strong-password") -> str:
    await client.post(
        "/api/admin/auth/register",
        json={"email": email, "password": password},
    )
    response = await client.post(
        "/api/admin/auth/login",
        json={"email": email, "password": password},
    )
    return response.json()["access_token"]


async def create_shop_for_admin(client, token: str, name: str = "Dalmegg Flower") -> int:
    response = await client.post(
        "/api/shops",
        json={
            "name": name,
            "region": "Busan",
            "address": "Busan National University",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    return response.json()["id"]


async def create_flower_for_admin(client, token: str, shop_id: int, name: str = "Rose") -> int:
    response = await client.post(
        "/api/flowers",
        data={
            "shop_id": shop_id,
            "name": name,
            "description": "Fresh flower",
            "color": "red",
            "price": 3000,
            "stock_quantity": 12,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    return response.json()["id"]
