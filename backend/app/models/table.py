from pydantic import BaseModel
from typing import Optional
from app.models.database import ConnectionInfo


class TableListRequest(BaseModel):
    connection: ConnectionInfo
    database_name: str
    schema_name: str


class TableListResponse(BaseModel):
    tables: list[str]


class CreateTableRequest(BaseModel):
    connection: ConnectionInfo
    database_name: str
    ddl: str


class DeleteTableRequest(BaseModel):
    connection: ConnectionInfo
    database_name: str
    schema_name: str
    table_name: str


class ColumnInfo(BaseModel):
    column_name: str
    data_type: str
    is_nullable: str
    column_default: Optional[str] = None


class IndexInfo(BaseModel):
    index_name: str
    column_name: str
    is_unique: bool


class TableStructureRequest(BaseModel):
    connection: ConnectionInfo
    database_name: str
    schema_name: str
    table_name: str


class TableStructureResponse(BaseModel):
    columns: list[ColumnInfo]
    indexes: list[IndexInfo]
