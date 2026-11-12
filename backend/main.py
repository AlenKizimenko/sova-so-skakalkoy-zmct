import os
from contextlib import asynccontextmanager
from uuid import uuid4

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

load_dotenv()
from backend.routers.ai import router, ApiError, Store
from ml.contracts import CONTRACT
from ml.models.baseline import Baseline


@asynccontextmanager
async def lifespan(app):
    app.state.store = Store(os.getenv("AI_DB_PATH", "data/ai.sqlite"))
    app.state.model = Baseline()
    yield
    await app.state.model.close()
    app.state.store.db.close()


app = FastAPI(title="Sova AI baseline", lifespan=lifespan)
app.include_router(router)
app.openapi = lambda: CONTRACT


@app.middleware("http")
async def request_id(request: Request, call_next):
    request.state.request_id = str(uuid4())
    response = await call_next(request)
    response.headers["X-Request-ID"] = request.state.request_id
    return response


@app.exception_handler(ApiError)
async def api_error(request, exc):
    return JSONResponse(status_code=exc.status, content=dict(request_id=request.state.request_id,
        code=exc.code, message=exc.message, issues=[], retryable=exc.retryable))


@app.exception_handler(RequestValidationError)
async def validation_error(request, exc):
    return await api_error(request, ApiError(422, "VALIDATION_ERROR", "Некорректный параметр запроса"))
