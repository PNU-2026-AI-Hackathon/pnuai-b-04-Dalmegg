from fastapi import APIRouter

from app.api.routes import auth, favorites, flowers, reviews, shops


api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(shops.router)
api_router.include_router(flowers.router)
api_router.include_router(reviews.router)
api_router.include_router(favorites.router)
