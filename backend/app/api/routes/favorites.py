from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.crud.favorite import create_favorite, delete_favorite, get_favorite, list_favorites
from app.crud.flower import flower_to_read_dict, get_flower
from app.db.session import get_db
from app.models.user import User
from app.schemas.favorite import FavoriteCreate, FavoriteRead
from app.schemas.flower import FlowerRead


router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.post("", response_model=FavoriteRead, status_code=status.HTTP_201_CREATED)
async def create_favorite_endpoint(
    favorite_in: FavoriteCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    flower = await get_flower(db, favorite_in.flower_id)
    if flower is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Flower not found.")

    existing = await get_favorite(db, current_user.id, favorite_in.flower_id)
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Flower already favorited.")

    return await create_favorite(db, current_user.id, favorite_in.flower_id)


@router.get("", response_model=list[FlowerRead])
async def list_favorites_endpoint(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    favorites = await list_favorites(db, current_user.id)
    return [flower_to_read_dict(favorite.flower) for favorite in favorites]


@router.delete("/{flower_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_favorite_endpoint(
    flower_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    favorite = await get_favorite(db, current_user.id, flower_id)
    if favorite is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Favorite not found.")
    await delete_favorite(db, favorite)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
