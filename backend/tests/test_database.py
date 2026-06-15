import asyncio

import pytest
from sqlalchemy import text
from sqlalchemy.exc import OperationalError

from app.db.session import AsyncSessionLocal


pytestmark = pytest.mark.asyncio


async def test_database_connection_executes_select():
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(text("SELECT 1"))
    except (OperationalError, OSError, asyncio.TimeoutError) as exc:
        pytest.skip(f"Configured database is not reachable: {exc}")

    assert result.scalar_one() == 1
