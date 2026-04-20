import pytest
from unittest.mock import patch, MagicMock
from httpx import AsyncClient, ASGITransport
from app.main import app

CONN_INFO = {
    "host": "localhost",
    "port": 5432,
    "database": "postgres",
    "user": "postgres",
    "password": "test",
}


def _mock_connection() -> MagicMock:
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_cursor.fetchall.return_value = [("postgres",), ("template0",), ("template1",)]
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)
    return mock_conn


@pytest.mark.asyncio
async def test_list_databases_success() -> None:
    mock_conn = _mock_connection()
    with patch("app.services.database.psycopg2.connect", return_value=mock_conn):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/databases/list", json=CONN_INFO)

    assert response.status_code == 200
    data = response.json()
    assert data["databases"] == ["postgres", "template0", "template1"]


@pytest.mark.asyncio
async def test_list_databases_connection_failure() -> None:
    with patch(
        "app.services.database.psycopg2.connect",
        side_effect=Exception("Connection refused"),
    ):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/databases/list", json=CONN_INFO)

    assert response.status_code == 500
    assert response.json()["detail"] == "データベースが取得できませんでした"


@pytest.mark.asyncio
async def test_create_database_success() -> None:
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    with patch("app.services.database.psycopg2.connect", return_value=mock_conn):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/databases/create",
                json={"connection": CONN_INFO, "name": "test_db"},
            )

    assert response.status_code == 200
    assert response.json()["message"] == "ok"


@pytest.mark.asyncio
async def test_create_database_failure() -> None:
    with patch(
        "app.services.database.psycopg2.connect",
        side_effect=Exception("Error"),
    ):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/databases/create",
                json={"connection": CONN_INFO, "name": "test_db"},
            )

    assert response.status_code == 500
    assert response.json()["detail"] == "データベースが作成できませんでした"


@pytest.mark.asyncio
async def test_delete_database_success() -> None:
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    with patch("app.services.database.psycopg2.connect", return_value=mock_conn):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/databases/delete",
                json={"connection": CONN_INFO, "name": "test_db"},
            )

    assert response.status_code == 200
    assert response.json()["message"] == "ok"


@pytest.mark.asyncio
async def test_delete_database_failure() -> None:
    with patch(
        "app.services.database.psycopg2.connect",
        side_effect=Exception("Error"),
    ):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/databases/delete",
                json={"connection": CONN_INFO, "name": "mydb"},
            )

    assert response.status_code == 500
    assert response.json()["detail"] == "mydbの削除できませんでした"


@pytest.mark.asyncio
async def test_create_database_invalid_encoding() -> None:
    """Encoding with SQL injection attempt should be rejected with 400."""
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    with patch("app.services.database.psycopg2.connect", return_value=mock_conn):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/databases/create",
                json={
                    "connection": CONN_INFO,
                    "name": "test_db",
                    "encoding": "UTF8'; DROP TABLE users;--",
                },
            )

    assert response.status_code == 400


@pytest.mark.asyncio
async def test_create_database_invalid_lc_collate() -> None:
    """lc_collate with invalid characters should be rejected with 400."""
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    with patch("app.services.database.psycopg2.connect", return_value=mock_conn):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/databases/create",
                json={
                    "connection": CONN_INFO,
                    "name": "test_db",
                    "lc_collate": "en_US.UTF-8'; DROP TABLE x;--",
                },
            )

    assert response.status_code == 400


@pytest.mark.asyncio
async def test_create_database_invalid_lc_ctype() -> None:
    """lc_ctype with invalid characters should be rejected with 400."""
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    with patch("app.services.database.psycopg2.connect", return_value=mock_conn):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/databases/create",
                json={
                    "connection": CONN_INFO,
                    "name": "test_db",
                    "lc_ctype": "C'; DROP TABLE x;--",
                },
            )

    assert response.status_code == 400


@pytest.mark.asyncio
async def test_create_database_valid_encoding() -> None:
    """Valid encoding value should be accepted."""
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    with patch("app.services.database.psycopg2.connect", return_value=mock_conn):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/databases/create",
                json={
                    "connection": CONN_INFO,
                    "name": "test_db",
                    "encoding": "UTF8",
                },
            )

    assert response.status_code == 200


@pytest.mark.asyncio
async def test_create_database_valid_locale() -> None:
    """Valid locale values should be accepted."""
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    with patch("app.services.database.psycopg2.connect", return_value=mock_conn):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/databases/create",
                json={
                    "connection": CONN_INFO,
                    "name": "test_db",
                    "lc_collate": "en_US.UTF-8",
                    "lc_ctype": "C",
                },
            )

    assert response.status_code == 200


@pytest.mark.asyncio
async def test_create_database_invalid_tablespace() -> None:
    """Tablespace with SQL injection attempt should be rejected with 400."""
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    with patch("app.services.database.psycopg2.connect", return_value=mock_conn):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/databases/create",
                json={
                    "connection": CONN_INFO,
                    "name": "test_db",
                    "tablespace_name": "pg_default; DROP TABLE x",
                },
            )

    assert response.status_code == 400


@pytest.mark.asyncio
async def test_create_database_invalid_owner() -> None:
    """Owner with SQL injection attempt should be rejected with 400."""
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    with patch("app.services.database.psycopg2.connect", return_value=mock_conn):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/databases/create",
                json={
                    "connection": CONN_INFO,
                    "name": "test_db",
                    "user_name": "admin'; DROP TABLE x;--",
                },
            )

    assert response.status_code == 400


@pytest.mark.asyncio
async def test_create_database_invalid_template() -> None:
    """Template with SQL injection attempt should be rejected with 400."""
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    with patch("app.services.database.psycopg2.connect", return_value=mock_conn):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/databases/create",
                json={
                    "connection": CONN_INFO,
                    "name": "test_db",
                    "template": "template1; DROP TABLE x",
                },
            )

    assert response.status_code == 400
