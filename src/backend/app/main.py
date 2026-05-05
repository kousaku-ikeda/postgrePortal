from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.models.common import HealthResponse
from app.routers import databases, schemas, tables, query

app = FastAPI(title="PostgreSQL Portal API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(databases.router)
app.include_router(schemas.router)
app.include_router(tables.router)
app.include_router(query.router)


@app.get("/api/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return HealthResponse(status="ok")


_DIST = Path(__file__).parent.parent.parent / "frontend" / "dist"

if _DIST.exists():
    app.mount("/posgre/assets", StaticFiles(directory=_DIST / "assets"), name="assets")

    @app.get("/posgre/favicon.svg")
    def favicon() -> FileResponse:
        return FileResponse(_DIST / "favicon.svg")

    @app.get("/posgre/icons.svg")
    def icons() -> FileResponse:
        return FileResponse(_DIST / "icons.svg")

    @app.get("/posgre/{full_path:path}")
    def serve_frontend(full_path: str) -> FileResponse:
        return FileResponse(_DIST / "index.html")
