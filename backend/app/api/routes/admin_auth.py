from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.crud.admin_user import create_admin, get_admin_by_email
from app.db.session import get_db
from app.models.admin_user import AdminUser
from app.schemas.admin_user import AdminUserCreate, AdminUserRead
from app.schemas.auth import LoginRequest, Token
from app.services.auth import authenticate_admin, issue_admin_access_token


router = APIRouter(prefix="/admin/auth", tags=["admin-auth"])


@router.post("/register", response_model=AdminUserRead, status_code=status.HTTP_201_CREATED)
async def register_admin(admin_in: AdminUserCreate, db: AsyncSession = Depends(get_db)) -> AdminUser:
    existing = await get_admin_by_email(db, admin_in.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered.")
    return await create_admin(db, admin_in)


@router.post("/login", response_model=Token)
async def login_admin(
    login_in: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> Token:
    admin = await authenticate_admin(db, login_in.email, login_in.password)
    return Token(access_token=issue_admin_access_token(admin))


@router.get("/me", response_model=AdminUserRead)
async def read_admin_me(current_admin: AdminUser = Depends(get_current_admin)) -> AdminUser:
    return current_admin
