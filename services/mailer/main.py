from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="mailer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080", "http://site:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SendRequest(BaseModel):
    event_id: str
    recipients: list[str]


@app.post("/send")
def send(req: SendRequest) -> dict:
    return {"status": "not_implemented", "message": "Mailer in development"}


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "mailer"}
