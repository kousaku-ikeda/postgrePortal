import re
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from app.models.database import ConnectionInfo, CreateDatabaseRequest

ALLOWED_ENCODINGS = {
    'UTF8', 'UTF-8', 'SQL_ASCII', 'LATIN1', 'WIN1252', 'EUC_JP', 'SJIS',
    'BIG5', 'KOI8R', 'MULE_INTERNAL', 'LATIN2', 'WIN1250', 'LATIN4',
    'LATIN5', 'LATIN7', 'LATIN8', 'LATIN9', 'LATIN10', 'WIN866', 'WIN874',
    'EUC_CN', 'EUC_KR', 'EUC_TW', 'GB18030', 'GBK', 'UHC',
}


def _validate_identifier(value: str) -> str:
    """識別子として安全な文字列かチェック（英数字・アンダースコアのみ許可）"""
    if not re.match(r'^[a-zA-Z_][a-zA-Z0-9_]*$', value):
        raise ValueError(f"Invalid identifier: {value}")
    return value


def _validate_locale(value: str) -> str:
    """ロケール値として安全な文字列かチェック（英数字・アンダースコア・ハイフン・ドットのみ許可）"""
    if not re.match(r'^[a-zA-Z0-9_.\-]+$', value):
        raise ValueError(f"Invalid locale value: {value}")
    return value


def _validate_encoding(value: str) -> str:
    """エンコーディング値が許可リストに含まれるかチェック"""
    if value.upper() not in ALLOWED_ENCODINGS:
        raise ValueError(f"Invalid encoding: {value}")
    return value


def get_database_list(conn_info: ConnectionInfo) -> list[str]:
    conn = psycopg2.connect(
        host=conn_info.host,
        port=conn_info.port,
        dbname=conn_info.database,
        user=conn_info.user,
        password=conn_info.password,
    )
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT datname FROM pg_database ORDER BY datname")
            rows = cur.fetchall()
            return [row[0] for row in rows]
    finally:
        conn.close()


def create_database(req: CreateDatabaseRequest) -> None:
    _validate_identifier(req.name)

    options: list[str] = []
    if req.user_name:
        _validate_identifier(req.user_name)
        options.append(f'OWNER = "{req.user_name}"')
    if req.template:
        _validate_identifier(req.template)
        options.append(f'TEMPLATE = "{req.template}"')
    if req.encoding:
        _validate_encoding(req.encoding)
        options.append(f"ENCODING = '{req.encoding}'")
    if req.lc_collate:
        _validate_locale(req.lc_collate)
        options.append(f"LC_COLLATE = '{req.lc_collate}'")
    if req.lc_ctype:
        _validate_locale(req.lc_ctype)
        options.append(f"LC_CTYPE = '{req.lc_ctype}'")
    if req.tablespace_name:
        _validate_identifier(req.tablespace_name)
        options.append(f'TABLESPACE = "{req.tablespace_name}"')
    if req.connlimit:
        try:
            limit_val = int(req.connlimit)
            options.append(f"CONNECTION LIMIT = {limit_val}")
        except ValueError:
            pass

    conn = psycopg2.connect(
        host=req.connection.host,
        port=req.connection.port,
        dbname=req.connection.database,
        user=req.connection.user,
        password=req.connection.password,
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    try:
        with conn.cursor() as cur:
            sql = f'CREATE DATABASE "{req.name}"'
            if options:
                sql += " WITH " + " ".join(options)
            cur.execute(sql)
    finally:
        conn.close()


def delete_database(conn_info: ConnectionInfo, name: str) -> None:
    _validate_identifier(name)

    conn = psycopg2.connect(
        host=conn_info.host,
        port=conn_info.port,
        dbname=conn_info.database,
        user=conn_info.user,
        password=conn_info.password,
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    try:
        with conn.cursor() as cur:
            cur.execute(f'DROP DATABASE "{name}"')
    finally:
        conn.close()
