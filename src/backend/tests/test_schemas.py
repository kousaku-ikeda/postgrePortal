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
    mock_cursor.fetchall.return_value = [("public",), ("pg_catalog",)]
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)
    return mock_conn


@pytest.mark.asyncio
async def test_list_schemas_success() -> None:
    mock_conn = _mock_connection()
    with patch("app.services.schema.psycopg2.connect", return_value=mock_conn):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/schemas/list",
                json={"connection": CONN_INFO, "database_name": "mydb"},
            )

    assert response.status_code == 200
    data = response.json()
    assert data["schemas"] == ["public", "pg_catalog"]


@pytest.mark.asyncio
async def test_list_schemas_failure() -> None:
    with patch(
        "app.services.schema.psycopg2.connect",
        side_effect=Exception("Connection refused"),
    ):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/schemas/list",
                json={"connection": CONN_INFO, "database_name": "mydb"},
            )

    assert response.status_code == 500


@pytest.mark.asyncio
async def test_create_schema_success() -> None:
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    with patch("app.services.schema.psycopg2.connect", return_value=mock_conn):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/schemas/create",
                json={
                    "connection": CONN_INFO,
                    "database_name": "mydb",
                    "schema_name": "test_schema",
                    "if_not_exists": True,
                },
            )

    assert response.status_code == 200
    assert response.json()["message"] == "ok"


@pytest.mark.asyncio
async def test_create_schema_failure() -> None:
    with patch(
        "app.services.schema.psycopg2.connect",
        side_effect=Exception("permission denied"),
    ):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/schemas/create",
                json={
                    "connection": CONN_INFO,
                    "database_name": "mydb",
                    "schema_name": "test_schema",
                    "if_not_exists": False,
                },
            )

    assert response.status_code == 500
    detail = response.json()["detail"]
    assert detail.startswith("スキーマを作成できませんでした。\n原因：")


@pytest.mark.asyncio
async def test_delete_schema_success() -> None:
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    with patch("app.services.schema.psycopg2.connect", return_value=mock_conn):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/schemas/delete",
                json={
                    "connection": CONN_INFO,
                    "database_name": "mydb",
                    "name": "test_schema",
                },
            )

    assert response.status_code == 200
    assert response.json()["message"] == "ok"


@pytest.mark.asyncio
async def test_delete_schema_failure() -> None:
    with patch(
        "app.services.schema.psycopg2.connect",
        side_effect=Exception("Error"),
    ):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/schemas/delete",
                json={
                    "connection": CONN_INFO,
                    "database_name": "mydb",
                    "name": "test_schema",
                },
            )

    assert response.status_code == 500
    assert response.json()["detail"] == "test_schemaの削除できませんでした"
