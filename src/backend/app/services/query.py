import psycopg2
from app.models.database import ConnectionInfo


def _resolve_type_names(
    conn: "psycopg2.extensions.connection",
    type_oids: list[int],
) -> list[str]:
    """Resolve PostgreSQL type OIDs to type names using pg_type catalog."""
    if not type_oids:
        return []
    with conn.cursor() as cur:
        cur.execute(
            "SELECT oid, typname FROM pg_catalog.pg_type WHERE oid = ANY(%s)",
            (type_oids,),
        )
        oid_map: dict[int, str] = {row[0]: row[1] for row in cur.fetchall()}
    return [oid_map.get(oid, "unknown") for oid in type_oids]


def execute_query(
    conn_info: ConnectionInfo,
    database_name: str,
    sql: str,
    limit: int = 100,
) -> tuple[list[str], list[dict[str, object]], int | None, list[str]]:
    conn = psycopg2.connect(
        host=conn_info.host,
        port=conn_info.port,
        dbname=database_name,
        user=conn_info.user,
        password=conn_info.password,
    )
    try:
        with conn.cursor() as cur:
            cur.execute(sql)

            # Check if the query returns rows (SELECT, etc.)
            if cur.description is not None:
                columns = [desc[0] for desc in cur.description]
                rows_raw = cur.fetchmany(limit)
                rows = [
                    {columns[i]: value for i, value in enumerate(row)}
                    for row in rows_raw
                ]
                affected_rows = len(rows)
                try:
                    type_oids = [
                        desc[1] for desc in cur.description
                        if len(desc) > 1
                    ]
                    if len(type_oids) == len(columns):
                        column_types = _resolve_type_names(conn, type_oids)
                    else:
                        column_types = []
                except Exception:
                    column_types = []
                result = (columns, rows, affected_rows, column_types)
            else:
                # Non-SELECT statements (INSERT, UPDATE, DELETE, etc.)
                affected_rows = cur.rowcount
                conn.commit()
                result = ([], [], affected_rows, [])
    finally:
        conn.close()

    # Save query history after successful execution
    save_query_history(conn_info, database_name, sql)

    return result


def save_query_history(
    conn_info: ConnectionInfo,
    database_name: str,
    query_text: str,
) -> None:
    """Save executed query to rireki.querylog table.

    This function is called after a successful query execution.
    Failures here are silently ignored so they do not affect the
    query result returned to the user.
    """
    try:
        conn = psycopg2.connect(
            host=conn_info.host,
            port=conn_info.port,
            dbname=database_name,
            user=conn_info.user,
            password=conn_info.password,
        )
        try:
            with conn.cursor() as cur:
                # Create schema if not exists
                cur.execute("CREATE SCHEMA IF NOT EXISTS rireki")

                # Create table if not exists
                cur.execute(
                    "CREATE TABLE IF NOT EXISTS rireki.querylog ("
                    "id SERIAL PRIMARY KEY, "
                    "executed_at TIMESTAMP NOT NULL DEFAULT NOW(), "
                    "query_text TEXT NOT NULL"
                    ")"
                )

                # Insert the executed query
                cur.execute(
                    "INSERT INTO rireki.querylog (executed_at, query_text) "
                    "VALUES (NOW(), %s)",
                    (query_text,),
                )

                # Check count and delete oldest if over 100
                cur.execute("SELECT COUNT(*) FROM rireki.querylog")
                row = cur.fetchone()
                if row is not None and row[0] > 100:
                    delete_count = row[0] - 100
                    cur.execute(
                        "DELETE FROM rireki.querylog "
                        "WHERE id IN ("
                        "SELECT id FROM rireki.querylog "
                        "ORDER BY executed_at ASC "
                        "LIMIT %s"
                        ")",
                        (delete_count,),
                    )

                conn.commit()
        finally:
            conn.close()
    except Exception:
        pass


def get_query_history(
    conn_info: ConnectionInfo,
    database_name: str,
) -> tuple[list[str], list[dict[str, object]]]:
    """Retrieve query history from rireki.querylog ordered by executed_at DESC."""
    conn = psycopg2.connect(
        host=conn_info.host,
        port=conn_info.port,
        dbname=database_name,
        user=conn_info.user,
        password=conn_info.password,
    )
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT EXISTS ("
                "SELECT 1 FROM information_schema.tables "
                "WHERE table_schema = 'rireki' AND table_name = 'querylog'"
                ")"
            )
            row = cur.fetchone()
            if row is None or not row[0]:
                return ["id", "executed_at", "query_text"], []

            cur.execute(
                "SELECT id, executed_at, query_text "
                "FROM rireki.querylog "
                "ORDER BY executed_at DESC"
            )
            columns = [desc[0] for desc in cur.description]
            rows_raw = cur.fetchall()
            rows = [
                {columns[i]: str(value) if value is not None else None for i, value in enumerate(row)}
                for row in rows_raw
            ]
            return columns, rows
    finally:
        conn.close()
