from fastapi import APIRouter

from app.api.routes import (
    admin_auth,
    admin_orders,
    admin_workshops,
    auth,
    bouquet_orders,
    chat,
    collections,
    dashboard,
    eco,
    favorites,
    flowers,
    orders,
    participants,
    programs,
    reservations,
    reviews,
    shops,
    users,
    workshops,
)


api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(admin_auth.router)
api_router.include_router(admin_orders.router)
api_router.include_router(admin_workshops.router)
api_router.include_router(reservations.admin_router)
api_router.include_router(bouquet_orders.admin_router)
api_router.include_router(chat.admin_router)
api_router.include_router(shops.router)
api_router.include_router(users.router)
api_router.include_router(flowers.router)
api_router.include_router(reviews.router)
api_router.include_router(favorites.router)
api_router.include_router(eco.router)
api_router.include_router(collections.router)
api_router.include_router(participants.router)
api_router.include_router(dashboard.router)
api_router.include_router(orders.router)
api_router.include_router(programs.router)
api_router.include_router(workshops.router)
api_router.include_router(reservations.router)
api_router.include_router(bouquet_orders.router)
api_router.include_router(chat.router)
