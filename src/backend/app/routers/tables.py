from fastapi import APIRouter, HTTPException
from app.models.table import (
    TableListRequest,
    TableListResponse,
    CreateTableRequest,
    DeleteTableRequest,
    TableStructureRequest,
    TableStructureResponse,
)
from app.models.database import MessageResponse
from app.services.table import (
    get_table_list,
    create_table,
    delete_table,
    get_table_structure,
)

router = APIRouter(prefix="/api/tables", tags=["tables"])


@router.post("/list", response_model=TableListResponse)
def list_tables(req: TableListRequest) -> TableListResponse:
    try:
        tables = get_table_list(req.connection, req.database_name, req.schema_name)
        return TableListResponse(tables=tables)
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="テーブルが取得できませんでした",
        )


@router.post("/create", response_model=MessageResponse)
def create_table_endpoint(req: CreateTableRequest) -> MessageResponse:
    try:
        create_table(req.connection, req.database_name, req.ddl)
        return MessageResponse(message="ok")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"クエリが間違っています。\n原因：{str(e)}",
        )


@router.post("/delete", response_model=MessageResponse)
def delete_table_endpoint(req: DeleteTableRequest) -> MessageResponse:
    try:
        delete_table(
            req.connection, req.database_name, req.schema_name, req.table_name
        )
        return MessageResponse(message="ok")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(
            status_code=500,
            detail=f"{req.table_name}の削除できませんでした",
        )


@router.post("/structure", response_model=TableStructureResponse)
def get_structure(req: TableStructureRequest) -> TableStructureResponse:
    try:
        columns, indexes = get_table_structure(
            req.connection, req.database_name, req.schema_name, req.table_name
        )
        return TableStructureResponse(columns=columns, indexes=indexes)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )
