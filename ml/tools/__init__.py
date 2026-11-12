"""Read-only weekday resolver for the event extraction scenario."""
import asyncio
import re
from datetime import date, timedelta
from zoneinfo import ZoneInfo

WEEKDAYS = {
    "понедельник": 0, "вторник": 1, "среду": 2, "четверг": 3,
    "пятницу": 4, "субботу": 5, "воскресенье": 6,
}
WEEKDAY = re.compile(r"\bво?\s+(" + "|".join(WEEKDAYS) + r")\b", re.I)


async def resolve_weekday(reference_date: str, timezone: str, weekday: str) -> str:
    """Return the first matching ISO day on or after the supplied reference."""
    ZoneInfo(timezone)
    start = date.fromisoformat(reference_date)
    return (start + timedelta(days=(WEEKDAYS[weekday] - start.weekday()) % 7)).isoformat()


async def invoke(name, arguments, *, allowed, timeout=0.2):
    """Dispatch only the calendar capability explicitly granted by the caller."""
    if name != "resolve_weekday" or name not in allowed:
        return {"status": "denied", "date": None}
    try:
        value = await asyncio.wait_for(resolve_weekday(**arguments), timeout=timeout)
        return {"status": "ok", "date": value}
    except TimeoutError:
        return {"status": "timeout", "date": None}
    except (ValueError, TypeError, KeyError):
        return {"status": "invalid_input", "date": None}
