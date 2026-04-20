from pydantic import BaseModel
from typing import Optional
from app.models.database import ConnectionInfo


class SchemaListRequest(BaseModel):
    connection: ConnectionInfo
    database_name: str


class SchemaListResponse(BaseModel):
    schemas: list[str]


class CreateSchemaRequest(BaseModel):
    connection: ConnectionInfo
    database_name: str
    schema_name: str
    user_name: Optional[str] = None
    schema_element: Optional[str] = None
    if_not_exists: bool = True


class DeleteSchemaRequest(BaseModel):
    connection: ConnectionInfo
    database_name: str
    name: str
