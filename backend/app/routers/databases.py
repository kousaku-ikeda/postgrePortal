from fastapi import APIRouter, HTTPException
from app.models.database import (
    ConnectionInfo,
    DatabaseListResponse,
    CreateDatabaseRequest,
    DeleteDatabaseRequest,
    MessageResponse,
)
from app.services.database import get_database_list, create_database, delete_database

router = APIRouter(prefix="/api/databases", tags=["databases"])


@router.post("/list", response_model=DatabaseListResponse)
def list_databases(conn_info: ConnectionInfo) -> DatabaseListResponse:
    try:
        databases = get_database_list(conn_info)
        return DatabaseListResponse(databases=databases)
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="データベースが取得できませんでした",
        )


@router.post("/create", response_model=MessageResponse)
def create_db(req: CreateDatabaseRequest) -> MessageResponse:
    try:
        create_database(req)
        return MessageResponse(message="ok")
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="データベースが作成できませんでした",
        )


@router.post("/delete", response_model=MessageResponse)
def delete_db(req: DeleteDatabaseRequest) -> MessageResponse:
    try:
        delete_database(req.connection, req.name)
        return MessageResponse(message="ok")
    except Exception:
        raise HTTPException(
            status_code=500,
            detail=f"{req.name}の削除できませんでした",
        )
