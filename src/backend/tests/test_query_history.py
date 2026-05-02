import pytest
from unittest.mock import patch, MagicMock, PropertyMock, call
from httpx import AsyncClient, ASGITransport
from app.main import app

CONN_INFO = {
    "host": "localhost",
    "port": 5432,
    "database": "postgres",
    "user": "postgres",
    "password": "test",
}

REQUEST_BODY = {
    "connection": CONN_INFO,
    "database_name": "mydb",
    "sql": "SELECT id FROM users",
    "limit": 100,
}


def _make_query_mock_conn() -> MagicMock:
    """Create a mock connection for the main query execution (SELECT)."""
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_cursor.description = [("id",)]
    mock_cursor.fetchmany.return_value = [(1,)]
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)
    return mock_conn


def _make_history_mock_conn() -> MagicMock:
    """Create a mock connection for the history saving."""
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)
    return mock_conn, mock_cursor


@pytest.mark.asyncio
async def test_query_history_creates_schema_if_not_exists() -> None:
    """BE-06-05: rireki スキーマが未存在の場合 CREATE SCHEMA IF NOT EXISTS rireki が実行される"""
    query_conn = _make_query_mock_conn()
    history_conn, history_cursor = _make_history_mock_conn()

    call_count = 0

    def connect_side_effect(**kwargs: object) -> MagicMock:
        nonlocal call_count
        call_count += 1
        if call_count == 1:
            return query_conn
        return history_conn

    with patch("app.services.query.psycopg2.connect", side_effect=connect_side_effect):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/query/execute", json=REQUEST_BODY)

    assert response.status_code == 200

    # Check that CREATE SCHEMA was called on the history cursor
    executed_sqls = [
        str(c[0][0]) for c in history_cursor.execute.call_args_list
    ]
    assert any("CREATE SCHEMA IF NOT EXISTS rireki" in sql for sql in executed_sqls)


@pytest.mark.asyncio
async def test_query_history_creates_table_if_not_exists() -> None:
    """BE-06-06: querylog テーブルが未存在の場合 CREATE TABLE IF NOT EXISTS rireki.querylog が実行される"""
    query_conn = _make_query_mock_conn()
    history_conn, history_cursor = _make_history_mock_conn()

    call_count = 0

    def connect_side_effect(**kwargs: object) -> MagicMock:
        nonlocal call_count
        call_count += 1
        if call_count == 1:
            return query_conn
        return history_conn

    with patch("app.services.query.psycopg2.connect", side_effect=connect_side_effect):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/query/execute", json=REQUEST_BODY)

    assert response.status_code == 200

    executed_sqls = [
        str(c[0][0]) for c in history_cursor.execute.call_args_list
    ]
    assert any("CREATE TABLE IF NOT EXISTS rireki.querylog" in sql for sql in executed_sqls)


@pytest.mark.asyncio
async def test_query_history_inserts_log_on_success() -> None:
    """BE-06-07: クエリ成功後に INSERT INTO rireki.querylog が実行される"""
    query_conn = _make_query_mock_conn()
    history_conn, history_cursor = _make_history_mock_conn()

    call_count = 0

    def connect_side_effect(**kwargs: object) -> MagicMock:
        nonlocal call_count
        call_count += 1
        if call_count == 1:
            return query_conn
        return history_conn

    with patch("app.services.query.psycopg2.connect", side_effect=connect_side_effect):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/query/execute", json=REQUEST_BODY)

    assert response.status_code == 200

    executed_calls = history_cursor.execute.call_args_list
    insert_calls = [
        c for c in executed_calls if "INSERT INTO rireki.querylog" in str(c[0][0])
    ]
    assert len(insert_calls) >= 1
    # Verify the query_text parameter is the user's SQL
    insert_call = insert_calls[0]
    assert insert_call[0][1] == ("SELECT id FROM users",)


@pytest.mark.asyncio
async def test_query_history_deletes_oldest_when_over_100() -> None:
    """BE-06-08: querylog が 100 件超過の場合、古い順に削除して 100 件を維持する"""
    query_conn = _make_query_mock_conn()
    history_conn, history_cursor = _make_history_mock_conn()

    # Mock fetchone to return count > 100 after INSERT
    history_cursor.fetchone.return_value = (101,)

    call_count = 0

    def connect_side_effect(**kwargs: object) -> MagicMock:
        nonlocal call_count
        call_count += 1
        if call_count == 1:
            return query_conn
        return history_conn

    with patch("app.services.query.psycopg2.connect", side_effect=connect_side_effect):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/query/execute", json=REQUEST_BODY)

    assert response.status_code == 200

    executed_sqls = [
        str(c[0][0]) for c in history_cursor.execute.call_args_list
    ]
    assert any("DELETE FROM rireki.querylog" in sql for sql in executed_sqls)


@pytest.mark.asyncio
async def test_query_history_not_saved_on_query_failure() -> None:
    """BE-06-09: クエリ失敗時は履歴保存処理が呼び出されない"""
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_cursor.execute.side_effect = Exception("syntax error")
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    with patch("app.services.query.psycopg2.connect", return_value=mock_conn) as mock_connect:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/query/execute", json=REQUEST_BODY)

    assert response.status_code == 500
    # Only one connect call (for the query itself), no second for history
    assert mock_connect.call_count == 1


@pytest.mark.asyncio
async def test_query_history_does_not_affect_query_result() -> None:
    """BE-06-10: 履歴保存が失敗してもクエリ結果は正常に返る"""
    query_conn = _make_query_mock_conn()

    call_count = 0

    def connect_side_effect(**kwargs: object) -> MagicMock:
        nonlocal call_count
        call_count += 1
        if call_count == 1:
            return query_conn
        # Second connection (for history) raises an exception
        raise Exception("history connection failed")

    with patch("app.services.query.psycopg2.connect", side_effect=connect_side_effect):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/query/execute", json=REQUEST_BODY)

    assert response.status_code == 200
    data = response.json()
    assert data["columns"] == ["id"]
    assert data["rows"] == [{"id": 1}]


@pytest.mark.asyncio
async def test_query_history_history_sql_not_recorded() -> None:
    """BE-06-11: 履歴保存処理自体のSQLはquerylogに記録されない"""
    query_conn = _make_query_mock_conn()
    history_conn, history_cursor = _make_history_mock_conn()

    call_count = 0

    def connect_side_effect(**kwargs: object) -> MagicMock:
        nonlocal call_count
        call_count += 1
        if call_count == 1:
            return query_conn
        return history_conn

    with patch("app.services.query.psycopg2.connect", side_effect=connect_side_effect):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/query/execute", json=REQUEST_BODY)

    assert response.status_code == 200

    # Check that INSERT INTO rireki.querylog is called only once (for the user's query)
    executed_calls = history_cursor.execute.call_args_list
    insert_calls = [
        c for c in executed_calls if "INSERT INTO rireki.querylog" in str(c[0][0])
    ]
    assert len(insert_calls) == 1
    # The only INSERT should be for the user's query, not for CREATE SCHEMA/TABLE/DELETE
    insert_params = insert_calls[0][0][1]
    assert insert_params == ("SELECT id FROM users",)


@pytest.mark.asyncio
async def test_get_query_history_success() -> None:
    """BE-06-12: クエリ履歴取得成功時に id, executed_at, query_text の行データが返る"""
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_cursor.description = [("id",), ("executed_at",), ("query_text",)]
    mock_cursor.fetchall.return_value = [
        (3, "2024-01-03 10:00:00", "SELECT 3"),
        (2, "2024-01-02 10:00:00", "SELECT 2"),
        (1, "2024-01-01 10:00:00", "SELECT 1"),
    ]
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    with patch("app.services.query.psycopg2.connect", return_value=mock_conn):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/query/history",
                json={
                    "connection": CONN_INFO,
                    "database_name": "mydb",
                },
            )

    assert response.status_code == 200
    data = response.json()
    assert data["columns"] == ["id", "executed_at", "query_text"]
    assert len(data["rows"]) == 3
    # executed_at descending order: newest first (values are stringified)
    assert data["rows"][0]["id"] == "3"
    assert data["rows"][0]["query_text"] == "SELECT 3"


@pytest.mark.asyncio
async def test_get_query_history_table_not_exists() -> None:
    """BE-06-13: rireki.querylog が存在しない場合にエラーレスポンスが返る"""
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_cursor.execute.side_effect = Exception(
        'relation "rireki.querylog" does not exist'
    )
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    with patch("app.services.query.psycopg2.connect", return_value=mock_conn):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/query/history",
                json={
                    "connection": CONN_INFO,
                    "database_name": "mydb",
                },
            )

    assert response.status_code == 500


@pytest.mark.asyncio
async def test_get_query_history_connection_failure() -> None:
    """BE-06-14: psycopg2.connect が例外を送出する場合にエラーレスポンスが返る"""
    with patch(
        "app.services.query.psycopg2.connect",
        side_effect=Exception("connection refused"),
    ):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/query/history",
                json={
                    "connection": CONN_INFO,
                    "database_name": "mydb",
                },
            )

    assert response.status_code == 500
