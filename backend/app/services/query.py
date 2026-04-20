import psycopg2
from app.models.database import ConnectionInfo


def execute_query(
    conn_info: ConnectionInfo,
    database_name: str,
    sql: str,
    limit: int = 100,
) -> tuple[list[str], list[dict[str, object]], int | None]:
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
                return columns, rows, affected_rows
            else:
                # Non-SELECT statements (INSERT, UPDATE, DELETE, etc.)
                affected_rows = cur.rowcount
                conn.commit()
                return [], [], affected_rows
    finally:
        conn.close()
