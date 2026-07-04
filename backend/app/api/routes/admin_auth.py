from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import bearer_scheme, get_current_admin
from app.core.security import decode_token_payload
from app.crud.admin_user import create_admin, get_admin_by_email
from app.crud.revoked_token import is_token_revoked, revoke_token
from app.db.session import get_db
from app.models.admin_user import AdminUser
from app.schemas.admin_user import AdminUserCreate, AdminUserRead
from app.schemas.auth import LoginRequest, LogoutRequest, RefreshTokenRequest, Token
from app.services.auth import authenticate_admin, issue_admin_access_token, issue_admin_refresh_token


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
    return Token(
        access_token=issue_admin_access_token(admin),
        refresh_token=issue_admin_refresh_token(admin),
    )


@router.get("/me", response_model=AdminUserRead)
async def read_admin_me(current_admin: AdminUser = Depends(get_current_admin)) -> AdminUser:
    return current_admin


async def _ensure_active_admin_refresh(db: AsyncSession, token: str) -> dict:
    payload = decode_token_payload(token, expected_type="admin_refresh")
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token.")
    jti = payload.get("jti")
    if isinstance(jti, str) and await is_token_revoked(db, jti):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token has been revoked.")
    return payload


async def _revoke_payload_token(db: AsyncSession, payload: dict) -> None:
    jti = payload.get("jti")
    token_type = payload.get("type")
    expires_at = payload.get("exp")
    if not isinstance(jti, str) or not isinstance(token_type, str) or not isinstance(expires_at, int):
        return
    await revoke_token(
        db,
        jti=jti,
        token_type=token_type,
        expires_at=datetime.fromtimestamp(expires_at, timezone.utc),
    )


@router.post("/refresh", response_model=Token)
async def refresh_admin_token(
    refresh_in: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
) -> Token:
    payload = await _ensure_active_admin_refresh(db, refresh_in.refresh_token)
    admin_id = payload.get("sub")
    if not isinstance(admin_id, str):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token.")

    from app.crud.admin_user import get_admin

    admin = await get_admin(db, int(admin_id))
    if admin is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin user not found.")
    await _revoke_payload_token(db, payload)
    return Token(
        access_token=issue_admin_access_token(admin),
        refresh_token=issue_admin_refresh_token(admin),
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout_admin(
    logout_in: LogoutRequest | None = None,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    _current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> None:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
        )

    payload = decode_token_payload(credentials.credentials, expected_type="admin")
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin token.")
    await _revoke_payload_token(db, payload)

    if logout_in and logout_in.refresh_token:
        refresh_payload = decode_token_payload(logout_in.refresh_token, expected_type="admin_refresh")
        if refresh_payload is not None:
            await _revoke_payload_token(db, refresh_payload)
