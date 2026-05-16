from fastapi import APIRouter, HTTPException
from app.models.query import (
    ExecuteQueryRequest,
    QueryResultResponse,
    QueryHistoryRequest,
    QueryHistoryResponse,
)
from app.services.query import execute_query, get_query_history

router = APIRouter(prefix="/api/query", tags=["query"])


@router.post("/execute", response_model=QueryResultResponse)
def execute(req: ExecuteQueryRequest) -> QueryResultResponse:
    try:
        columns, rows, affected_rows, column_types = execute_query(
            req.connection, req.database_name, req.sql, req.limit
        )
        return QueryResultResponse(
            columns=columns,
            rows=rows,
            affected_rows=affected_rows,
            column_types=column_types,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"クエリが間違っています。\n原因：{str(e)}",
        )


@router.post("/history", response_model=QueryHistoryResponse)
def history(req: QueryHistoryRequest) -> QueryHistoryResponse:
    try:
        columns, rows = get_query_history(
            req.connection, req.database_name
        )
        return QueryHistoryResponse(columns=columns, rows=rows)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="クエリ履歴の取得中にエラーが発生しました",
        )
