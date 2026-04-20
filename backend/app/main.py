from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models.common import HealthResponse
from app.routers import databases, schemas, tables, query

app = FastAPI(title="PostgreSQL Portal API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost"],
    allow_credentials=True,
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
