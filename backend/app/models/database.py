from pydantic import BaseModel
from typing import Optional


class ConnectionInfo(BaseModel):
    host: str
    port: int
    database: str
    user: str
    password: str


class DatabaseListResponse(BaseModel):
    databases: list[str]


class CreateDatabaseRequest(BaseModel):
    connection: ConnectionInfo
    name: str
    user_name: Optional[str] = None
    template: Optional[str] = None
    encoding: Optional[str] = None
    lc_collate: Optional[str] = None
    lc_ctype: Optional[str] = None
    tablespace_name: Optional[str] = None
    connlimit: Optional[str] = None


class DeleteDatabaseRequest(BaseModel):
    connection: ConnectionInfo
    name: str


class MessageResponse(BaseModel):
    message: str
