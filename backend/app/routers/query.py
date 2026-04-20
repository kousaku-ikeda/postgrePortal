from fastapi import APIRouter, HTTPException
from app.models.query import ExecuteQueryRequest, QueryResultResponse
from app.services.query import execute_query

router = APIRouter(prefix="/api/query", tags=["query"])


@router.post("/execute", response_model=QueryResultResponse)
def execute(req: ExecuteQueryRequest) -> QueryResultResponse:
    try:
        columns, rows, affected_rows = execute_query(
            req.connection, req.database_name, req.sql, req.limit
        )
        return QueryResultResponse(
            columns=columns,
            rows=rows,
            affected_rows=affected_rows,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"クエリが間違っています。\n原因：{str(e)}",
        )
