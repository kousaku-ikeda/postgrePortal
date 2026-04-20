import re
import psycopg2
from app.models.database import ConnectionInfo
from app.models.schema import CreateSchemaRequest


def _validate_identifier(name: str) -> bool:
    """Validate that name is a safe SQL identifier."""
    return bool(re.match(r'^[a-zA-Z_][a-zA-Z0-9_]*$', name))


def get_schema_list(conn_info: ConnectionInfo, database_name: str) -> list[str]:
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
                "SELECT schema_name FROM information_schema.schemata "
                "WHERE schema_name NOT LIKE 'pg_%%' "
                "AND schema_name != 'information_schema' "
                "ORDER BY schema_name"
            )
            rows = cur.fetchall()
            return [row[0] for row in rows]
    finally:
        conn.close()


def create_schema(req: CreateSchemaRequest) -> None:
    if not _validate_identifier(req.schema_name):
        raise ValueError(f"Invalid schema name: {req.schema_name}")

    conn = psycopg2.connect(
        host=req.connection.host,
        port=req.connection.port,
        dbname=req.database_name,
        user=req.connection.user,
        password=req.connection.password,
    )
    try:
        with conn.cursor() as cur:
            sql = "CREATE SCHEMA"
            if req.if_not_exists:
                sql += " IF NOT EXISTS"
            sql += f' "{req.schema_name}"'

            if req.user_name and _validate_identifier(req.user_name):
                sql += f' AUTHORIZATION "{req.user_name}"'

            cur.execute(sql)
        conn.commit()
    finally:
        conn.close()


def delete_schema(conn_info: ConnectionInfo, database_name: str, name: str) -> None:
    if not _validate_identifier(name):
        raise ValueError(f"Invalid schema name: {name}")

    conn = psycopg2.connect(
        host=conn_info.host,
        port=conn_info.port,
        dbname=database_name,
        user=conn_info.user,
        password=conn_info.password,
    )
    try:
        with conn.cursor() as cur:
            cur.execute(f'DROP SCHEMA "{name}" CASCADE')
        conn.commit()
    finally:
        conn.close()
