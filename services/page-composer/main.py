from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="page-composer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080", "http://site:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ComposeRequest(BaseModel):
    event_id: str


class Block(BaseModel):
    type: str
    order: int
    data: dict[str, Any]


class ComposeResponse(BaseModel):
    event_id: str
    blocks: list[Block]


def load_event(event_id: str) -> dict[str, Any]:
    # TODO: подключить БД в следующей итерации.
    return {
        "title": "Встреча в кафе",
        "price": 500.0,
        "location": "Кафе «Пушкин», Невский проспект, 1",
        "description": "Тестовое описание мероприятия.",
    }


def build_blocks(event: dict[str, Any]) -> list[Block]:
    blocks = [Block(type="hero", order=0, data={"title": event.get("title") or "Мероприятие"})]
    price = event.get("price")
    if price is not None and price > 0:
        blocks.append(Block(type="pricing", order=1, data={"price": price}))
    if event.get("location"):
        blocks.append(Block(type="location", order=2, data={"location": event["location"]}))
    if event.get("description"):
        blocks.append(Block(type="description", order=3, data={"description": event["description"]}))
    return blocks


@app.post("/compose", response_model=ComposeResponse)
def compose(req: ComposeRequest) -> ComposeResponse:
    event = load_event(req.event_id)
    return ComposeResponse(event_id=req.event_id, blocks=build_blocks(event))


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "page-composer"}
