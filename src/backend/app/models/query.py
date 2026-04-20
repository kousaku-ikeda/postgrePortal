from pydantic import BaseModel
from typing import Optional
from app.models.database import ConnectionInfo


class ExecuteQueryRequest(BaseModel):
    connection: ConnectionInfo
    database_name: str
    sql: str
    limit: int = 100


class QueryResultResponse(BaseModel):
    columns: list[str]
    rows: list[dict[str, object]]
    affected_rows: Optional[int] = None
