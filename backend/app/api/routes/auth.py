from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import bearer_scheme
from app.core.security import decode_token_payload
from app.crud.admin_user import get_admin, get_admin_by_email
from app.crud.revoked_token import is_token_revoked, revoke_token
from app.crud.user import create_user, get_user, get_user_by_email
from app.db.session import get_db
from app.models.admin_user import AdminUser
from app.models.user import User
from app.schemas.auth import AuthMeRead, LoginRequest, LogoutRequest, RefreshTokenRequest, Token
from app.schemas.user import UserCreate, UserRead
from app.services.auth import (
    authenticate_admin,
    authenticate_user,
    issue_access_token,
    issue_admin_access_token,
    issue_admin_refresh_token,
    issue_refresh_token,
)


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)) -> User:
    existing = await get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered.")
    return await create_user(db, user_in)


@router.post("/login", response_model=Token)
async def login(
    login_in: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> Token:
    admin = await get_admin_by_email(db, login_in.email)
    if admin is not None:
        admin = await authenticate_admin(db, login_in.email, login_in.password)
        return Token(
            access_token=issue_admin_access_token(admin),
            refresh_token=issue_admin_refresh_token(admin),
        )

    user = await authenticate_user(db, login_in.email, login_in.password)
    return Token(access_token=issue_access_token(user), refresh_token=issue_refresh_token(user))


async def _ensure_active_payload(
    db: AsyncSession,
    token: str,
    expected_type: str,
) -> dict:
    payload = decode_token_payload(token, expected_type=expected_type)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token.")
    jti = payload.get("jti")
    if isinstance(jti, str) and await is_token_revoked(db, jti):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has been revoked.")
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


def _admin_me(admin: AdminUser) -> AuthMeRead:
    return AuthMeRead(
        id=admin.id,
        email=admin.email,
        full_name=admin.full_name,
        is_active=admin.is_active,
        role="admin",
    )


def _user_me(user: User) -> AuthMeRead:
    return AuthMeRead(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
        role="user",
    )


@router.get("/me", response_model=AuthMeRead)
async def read_me(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> AuthMeRead:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
        )

    admin_payload = decode_token_payload(credentials.credentials, expected_type="admin")
    if admin_payload is not None:
        await _ensure_active_payload(db, credentials.credentials, "admin")
        admin = await get_admin(db, int(admin_payload["sub"]))
        if admin is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin user not found.")
        return _admin_me(admin)

    user_payload = await _ensure_active_payload(db, credentials.credentials, "user")
    subject = user_payload.get("sub")
    if not isinstance(subject, str):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token.")

    user = await get_user(db, int(subject))
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")
    return _user_me(user)


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_in: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
) -> Token:
    admin_payload = decode_token_payload(refresh_in.refresh_token, expected_type="admin_refresh")
    if admin_payload is not None:
        payload = await _ensure_active_payload(db, refresh_in.refresh_token, "admin_refresh")
        admin = await get_admin(db, int(payload["sub"]))
        if admin is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin user not found.")
        await _revoke_payload_token(db, payload)
        return Token(
            access_token=issue_admin_access_token(admin),
            refresh_token=issue_admin_refresh_token(admin),
        )

    payload = await _ensure_active_payload(db, refresh_in.refresh_token, "user_refresh")
    user = await get_user(db, int(payload["sub"]))
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")
    await _revoke_payload_token(db, payload)
    return Token(access_token=issue_access_token(user), refresh_token=issue_refresh_token(user))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    logout_in: LogoutRequest | None = None,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> None:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
        )

    payload = (
        decode_token_payload(credentials.credentials, expected_type="admin")
        or decode_token_payload(credentials.credentials, expected_type="user")
    )
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token.")
    await _revoke_payload_token(db, payload)

    if logout_in and logout_in.refresh_token:
        refresh_payload = (
            decode_token_payload(logout_in.refresh_token, expected_type="admin_refresh")
            or decode_token_payload(logout_in.refresh_token, expected_type="user_refresh")
        )
        if refresh_payload is not None:
            await _revoke_payload_token(db, refresh_payload)
