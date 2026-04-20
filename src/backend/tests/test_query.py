import pytest
from unittest.mock import patch, MagicMock, PropertyMock
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
async def test_execute_select_query_success() -> None:
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_cursor.description = [("id",), ("name",)]
    mock_cursor.fetchmany.return_value = [(1, "Alice"), (2, "Bob")]
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    with patch("app.services.query.psycopg2.connect", return_value=mock_conn):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/query/execute",
                json={
                    "connection": CONN_INFO,
                    "database_name": "mydb",
                    "sql": "SELECT id, name FROM users",
                    "limit": 100,
                },
            )

    assert response.status_code == 200
    data = response.json()
    assert data["columns"] == ["id", "name"]
    assert len(data["rows"]) == 2
    assert data["rows"][0]["id"] == 1
    assert data["rows"][0]["name"] == "Alice"
    assert data["affected_rows"] == 2


@pytest.mark.asyncio
async def test_execute_non_select_query_success() -> None:
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_cursor.description = None
    type(mock_cursor).rowcount = PropertyMock(return_value=3)
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    with patch("app.services.query.psycopg2.connect", return_value=mock_conn):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/query/execute",
                json={
                    "connection": CONN_INFO,
                    "database_name": "mydb",
                    "sql": "UPDATE users SET name='test'",
                    "limit": 100,
                },
            )

    assert response.status_code == 200
    data = response.json()
    assert data["columns"] == []
    assert data["rows"] == []
    assert data["affected_rows"] == 3


@pytest.mark.asyncio
async def test_execute_query_failure() -> None:
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_cursor.execute.side_effect = Exception("syntax error at or near \"SELEC\"")
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    with patch("app.services.query.psycopg2.connect", return_value=mock_conn):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/query/execute",
                json={
                    "connection": CONN_INFO,
                    "database_name": "mydb",
                    "sql": "SELEC * FROM users",
                    "limit": 100,
                },
            )

    assert response.status_code == 500
    detail = response.json()["detail"]
    assert detail.startswith("クエリが間違っています。\n原因：")


@pytest.mark.asyncio
async def test_execute_query_default_limit() -> None:
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_cursor.description = [("id",)]
    mock_cursor.fetchmany.return_value = [(1,)]
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    with patch("app.services.query.psycopg2.connect", return_value=mock_conn):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/query/execute",
                json={
                    "connection": CONN_INFO,
                    "database_name": "mydb",
                    "sql": "SELECT id FROM users",
                },
            )

    assert response.status_code == 200
    # Verify fetchmany was called with default limit 100
    mock_cursor.fetchmany.assert_called_once_with(100)
