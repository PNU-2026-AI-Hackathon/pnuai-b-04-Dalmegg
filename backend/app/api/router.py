from fastapi import APIRouter

from app.api.routes import (
    admin_auth,
    admin_orders,
    admin_workshops,
    auth,
    eco,
    favorites,
    flowers,
    orders,
    reviews,
    shops,
    workshops,
)


api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(admin_auth.router)
api_router.include_router(admin_orders.router)
api_router.include_router(admin_workshops.router)
api_router.include_router(shops.router)
api_router.include_router(flowers.router)
api_router.include_router(reviews.router)
api_router.include_router(favorites.router)
api_router.include_router(eco.router)
api_router.include_router(orders.router)
api_router.include_router(workshops.router)
