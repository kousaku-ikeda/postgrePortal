from fastapi import APIRouter, HTTPException
from app.models.schema import (
    SchemaListRequest,
    SchemaListResponse,
    CreateSchemaRequest,
    DeleteSchemaRequest,
)
from app.models.database import MessageResponse
from app.services.schema import get_schema_list, create_schema, delete_schema

router = APIRouter(prefix="/api/schemas", tags=["schemas"])


@router.post("/list", response_model=SchemaListResponse)
def list_schemas(req: SchemaListRequest) -> SchemaListResponse:
    try:
        schemas = get_schema_list(req.connection, req.database_name)
        return SchemaListResponse(schemas=schemas)
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="スキーマが取得できませんでした",
        )


@router.post("/create", response_model=MessageResponse)
def create_schema_endpoint(req: CreateSchemaRequest) -> MessageResponse:
    try:
        create_schema(req)
        return MessageResponse(message="ok")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"スキーマを作成できませんでした。\n原因：{str(e)}",
        )


@router.post("/delete", response_model=MessageResponse)
def delete_schema_endpoint(req: DeleteSchemaRequest) -> MessageResponse:
    try:
        delete_schema(req.connection, req.database_name, req.name)
        return MessageResponse(message="ok")
    except Exception:
        raise HTTPException(
            status_code=500,
            detail=f"{req.name}の削除できませんでした",
        )
