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


@pytest.mark.asyncio
async def test_list_tables_success() -> None:
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_cursor.fetchall.return_value = [("users",), ("orders",)]
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    with patch("app.services.table.psycopg2.connect", return_value=mock_conn):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/tables/list",
                json={
                    "connection": CONN_INFO,
                    "database_name": "mydb",
                    "schema_name": "public",
                },
            )

    assert response.status_code == 200
    assert response.json()["tables"] == ["users", "orders"]


@pytest.mark.asyncio
async def test_list_tables_failure() -> None:
    with patch(
        "app.services.table.psycopg2.connect",
        side_effect=Exception("Connection refused"),
    ):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/tables/list",
                json={
                    "connection": CONN_INFO,
                    "database_name": "mydb",
                    "schema_name": "public",
                },
            )

    assert response.status_code == 500


@pytest.mark.asyncio
async def test_create_table_success() -> None:
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    with patch("app.services.table.psycopg2.connect", return_value=mock_conn):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/tables/create",
                json={
                    "connection": CONN_INFO,
                    "database_name": "mydb",
                    "ddl": "CREATE TABLE public.test_table (id SERIAL PRIMARY KEY)",
                },
            )

    assert response.status_code == 200
    assert response.json()["message"] == "ok"


@pytest.mark.asyncio
async def test_create_table_failure() -> None:
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_cursor.execute.side_effect = Exception("syntax error at or near")
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    with patch("app.services.table.psycopg2.connect", return_value=mock_conn):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/tables/create",
                json={
                    "connection": CONN_INFO,
                    "database_name": "mydb",
                    "ddl": "INVALID SQL",
                },
            )

    assert response.status_code == 500
    detail = response.json()["detail"]
    assert detail.startswith("クエリが間違っています。\n原因：")


@pytest.mark.asyncio
async def test_delete_table_success() -> None:
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    with patch("app.services.table.psycopg2.connect", return_value=mock_conn):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/tables/delete",
                json={
                    "connection": CONN_INFO,
                    "database_name": "mydb",
                    "schema_name": "public",
                    "table_name": "test_table",
                },
            )

    assert response.status_code == 200
    assert response.json()["message"] == "ok"


@pytest.mark.asyncio
async def test_delete_table_failure() -> None:
    with patch(
        "app.services.table.psycopg2.connect",
        side_effect=Exception("Error"),
    ):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/tables/delete",
                json={
                    "connection": CONN_INFO,
                    "database_name": "mydb",
                    "schema_name": "public",
                    "table_name": "test_table",
                },
            )

    assert response.status_code == 500
    assert response.json()["detail"] == "test_tableの削除できませんでした"


@pytest.mark.asyncio
async def test_table_structure_success() -> None:
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    # First call returns columns, second call returns indexes
    mock_cursor.fetchall.side_effect = [
        [("id", "integer", "NO", "nextval('test_id_seq'::regclass)")],
        [("test_pkey", "id", True)],
    ]
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    with patch("app.services.table.psycopg2.connect", return_value=mock_conn):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/tables/structure",
                json={
                    "connection": CONN_INFO,
                    "database_name": "mydb",
                    "schema_name": "public",
                    "table_name": "test_table",
                },
            )

    assert response.status_code == 200
    data = response.json()
    assert len(data["columns"]) == 1
    assert data["columns"][0]["column_name"] == "id"
    assert len(data["indexes"]) == 1
    assert data["indexes"][0]["index_name"] == "test_pkey"
    assert data["indexes"][0]["is_unique"] is True
