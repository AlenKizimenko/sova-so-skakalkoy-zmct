from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="vk-publisher")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080", "http://site:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PublishRequest(BaseModel):
    event_id: str


@app.post("/publish")
def publish(req: PublishRequest) -> dict:
    return {"status": "not_implemented", "message": "VK Publisher in development"}


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "vk-publisher"}
