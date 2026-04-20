import re
import psycopg2
from app.models.database import ConnectionInfo
from app.models.table import ColumnInfo, IndexInfo


def _validate_identifier(name: str) -> bool:
    """Validate that name is a safe SQL identifier."""
    return bool(re.match(r'^[a-zA-Z_][a-zA-Z0-9_]*$', name))


def get_table_list(
    conn_info: ConnectionInfo, database_name: str, schema_name: str
) -> list[str]:
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
                "SELECT table_name FROM information_schema.tables "
                "WHERE table_schema = %s AND table_type = 'BASE TABLE' "
                "ORDER BY table_name",
                (schema_name,),
            )
            rows = cur.fetchall()
            return [row[0] for row in rows]
    finally:
        conn.close()


def create_table(
    conn_info: ConnectionInfo, database_name: str, ddl: str
) -> None:
    conn = psycopg2.connect(
        host=conn_info.host,
        port=conn_info.port,
        dbname=database_name,
        user=conn_info.user,
        password=conn_info.password,
    )
    try:
        with conn.cursor() as cur:
            cur.execute(ddl)
        conn.commit()
    finally:
        conn.close()


def delete_table(
    conn_info: ConnectionInfo,
    database_name: str,
    schema_name: str,
    table_name: str,
) -> None:
    if not _validate_identifier(schema_name):
        raise ValueError(f"Invalid schema name: {schema_name}")
    if not _validate_identifier(table_name):
        raise ValueError(f"Invalid table name: {table_name}")

    conn = psycopg2.connect(
        host=conn_info.host,
        port=conn_info.port,
        dbname=database_name,
        user=conn_info.user,
        password=conn_info.password,
    )
    try:
        with conn.cursor() as cur:
            cur.execute(f'DROP TABLE "{schema_name}"."{table_name}"')
        conn.commit()
    finally:
        conn.close()


def get_table_structure(
    conn_info: ConnectionInfo,
    database_name: str,
    schema_name: str,
    table_name: str,
) -> tuple[list[ColumnInfo], list[IndexInfo]]:
    conn = psycopg2.connect(
        host=conn_info.host,
        port=conn_info.port,
        dbname=database_name,
        user=conn_info.user,
        password=conn_info.password,
    )
    try:
        with conn.cursor() as cur:
            # Get columns
            cur.execute(
                "SELECT column_name, data_type, is_nullable, column_default "
                "FROM information_schema.columns "
                "WHERE table_schema = %s AND table_name = %s "
                "ORDER BY ordinal_position",
                (schema_name, table_name),
            )
            columns = [
                ColumnInfo(
                    column_name=row[0],
                    data_type=row[1],
                    is_nullable=row[2],
                    column_default=row[3],
                )
                for row in cur.fetchall()
            ]

            # Get indexes
            cur.execute(
                "SELECT i.relname AS index_name, "
                "a.attname AS column_name, "
                "ix.indisunique AS is_unique "
                "FROM pg_index ix "
                "JOIN pg_class t ON t.oid = ix.indrelid "
                "JOIN pg_class i ON i.oid = ix.indexrelid "
                "JOIN pg_namespace n ON n.oid = t.relnamespace "
                "JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey) "
                "WHERE n.nspname = %s AND t.relname = %s "
                "ORDER BY i.relname",
                (schema_name, table_name),
            )
            indexes = [
                IndexInfo(
                    index_name=row[0],
                    column_name=row[1],
                    is_unique=row[2],
                )
                for row in cur.fetchall()
            ]

            return columns, indexes
    finally:
        conn.close()
