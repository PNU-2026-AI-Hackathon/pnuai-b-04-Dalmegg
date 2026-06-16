from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.admin_user import AdminUser
from app.schemas.admin_user import AdminUserCreate


async def get_admin_by_email(db: AsyncSession, email: str) -> AdminUser | None:
    result = await db.execute(select(AdminUser).where(AdminUser.email == email))
    return result.scalar_one_or_none()


async def get_admin(db: AsyncSession, admin_id: int) -> AdminUser | None:
    result = await db.execute(select(AdminUser).where(AdminUser.id == admin_id))
    return result.scalar_one_or_none()


async def create_admin(db: AsyncSession, admin_in: AdminUserCreate) -> AdminUser:
    admin = AdminUser(
        email=admin_in.email,
        hashed_password=hash_password(admin_in.password),
        full_name=admin_in.full_name,
    )
    db.add(admin)
    await db.commit()
    await db.refresh(admin)
    return admin
