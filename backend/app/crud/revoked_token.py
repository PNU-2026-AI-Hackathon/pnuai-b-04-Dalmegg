from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.revoked_token import RevokedToken


def _normalize_expires_at(expires_at: datetime) -> datetime:
    if expires_at.tzinfo is None:
        return expires_at.replace(tzinfo=timezone.utc)
    return expires_at


async def revoke_token(
    db: AsyncSession,
    *,
    jti: str,
    token_type: str,
    expires_at: datetime,
) -> RevokedToken:
    existing = await get_revoked_token(db, jti)
    if existing is not None:
        return existing

    revoked = RevokedToken(
        jti=jti,
        token_type=token_type,
        expires_at=_normalize_expires_at(expires_at),
    )
    db.add(revoked)
    await db.commit()
    await db.refresh(revoked)
    return revoked


async def get_revoked_token(db: AsyncSession, jti: str) -> RevokedToken | None:
    result = await db.execute(select(RevokedToken).where(RevokedToken.jti == jti))
    return result.scalar_one_or_none()


async def is_token_revoked(db: AsyncSession, jti: str) -> bool:
    return await get_revoked_token(db, jti) is not None
