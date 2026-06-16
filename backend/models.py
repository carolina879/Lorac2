

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    username: str


class RoomCreate(BaseModel):
    name: str


class MessageCreate(BaseModel):
    content: str
    subtype: str = "text"


class CalendarEventCreate(BaseModel):
    title: str
    date: str
    description: Optional[str] = ""


class StudySessionCreate(BaseModel):
    user_id: str
    room_id: str
    start_time: datetime
    end_time: datetime
    duration_seconds: int