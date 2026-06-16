
import os
import uuid
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging

logger = logging.getLogger("studysync.db")

DATA_DIR = "data"
USERS_FILE = os.path.join(DATA_DIR, "users.xlsx")
ROOMS_FILE = os.path.join(DATA_DIR, "rooms.xlsx")
MESSAGES_FILE = os.path.join(DATA_DIR, "messages.xlsx")
SESSIONS_FILE = os.path.join(DATA_DIR, "study_sessions.xlsx")
CALENDAR_FILE = os.path.join(DATA_DIR, "calendar.xlsx")


class ExcelDatabase:
    def __init__(self):
        self.users_df = None
        self.rooms_df = None
        self.messages_df = None
        self.sessions_df = None
        self.calendar_df = None

    def initialize(self):
        os.makedirs(DATA_DIR, exist_ok=True)

        if os.path.exists(USERS_FILE):
            self.users_df = pd.read_excel(USERS_FILE)
        else:
            self.users_df = pd.DataFrame(columns=["id", "username", "created_at"])
            self.users_df.to_excel(USERS_FILE, index=False)

        if os.path.exists(ROOMS_FILE):
            self.rooms_df = pd.read_excel(ROOMS_FILE)
        else:
            default_rooms = [
                ("e9ba462d-06ba-447e-9dce-828e403ad0f8", "Matemática & Exatas", datetime.now().isoformat()),
                ("e2a58745-ce1c-4c4e-b98b-a4ab92cfe872", "Programação & Tech", datetime.now().isoformat()),
                ("fbce89b7-c69f-4880-a852-4924ef011306", "Humanas & Ciências", datetime.now().isoformat()),
                ("33b7abfe-043f-40f9-b271-a6c766b3a355", "Sala Livre", datetime.now().isoformat()),
            ]
            self.rooms_df = pd.DataFrame(default_rooms, columns=["id", "name", "created_at"])
            self.rooms_df.to_excel(ROOMS_FILE, index=False)

        if os.path.exists(MESSAGES_FILE):
            self.messages_df = pd.read_excel(MESSAGES_FILE)
        else:
            self.messages_df = pd.DataFrame(columns=["id", "room_id", "user_id", "username", "content", "subtype", "timestamp"])
            self.messages_df.to_excel(MESSAGES_FILE, index=False)

        if os.path.exists(SESSIONS_FILE):
            self.sessions_df = pd.read_excel(SESSIONS_FILE)
        else:
            self.sessions_df = pd.DataFrame(columns=["id", "user_id", "room_id", "start_time", "end_time", "duration_seconds"])
            self.sessions_df.to_excel(SESSIONS_FILE, index=False)

        if os.path.exists(CALENDAR_FILE):
            self.calendar_df = pd.read_excel(CALENDAR_FILE)
        else:
            self.calendar_df = pd.DataFrame(columns=["id", "user_id", "title", "date", "description", "created_at"])
            self.calendar_df.to_excel(CALENDAR_FILE, index=False)

        logger.info("Banco de dados Excel inicializado")

    def _save_users(self):
        self.users_df.to_excel(USERS_FILE, index=False)

    def _save_rooms(self):
        self.rooms_df.to_excel(ROOMS_FILE, index=False)

    def _save_messages(self):
        self.messages_df.to_excel(MESSAGES_FILE, index=False)

    def _save_sessions(self):
        self.sessions_df.to_excel(SESSIONS_FILE, index=False)

    def _save_calendar(self):
        self.calendar_df.to_excel(CALENDAR_FILE, index=False)

    def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        users = self.users_df[self.users_df["id"] == user_id]
        if users.empty:
            return None
        return users.iloc[0].to_dict()

    def get_user_by_username(self, username: str) -> Optional[Dict]:
        users = self.users_df[self.users_df["username"].str.lower() == username.lower()]
        if users.empty:
            return None
        return users.iloc[0].to_dict()

    def create_user(self, username: str) -> Dict:
        user_id = str(uuid.uuid4())
        created_at = datetime.now().isoformat()
        new_user = pd.DataFrame([{
            "id": user_id,
            "username": username,
            "created_at": created_at
        }])
        self.users_df = pd.concat([self.users_df, new_user], ignore_index=True)
        self._save_users()
        return {"id": user_id, "username": username, "created_at": created_at}

    def get_all_rooms(self) -> List[Dict]:
        return self.rooms_df.to_dict("records")

    def get_room_by_id(self, room_id: str) -> Optional[Dict]:
        rooms = self.rooms_df[self.rooms_df["id"] == room_id]
        if rooms.empty:
            return None
        return rooms.iloc[0].to_dict()

    def create_room(self, name: str) -> Dict:
        room_id = str(uuid.uuid4())
        created_at = datetime.now().isoformat()
        new_room = pd.DataFrame([{
            "id": room_id,
            "name": name,
            "created_at": created_at
        }])
        self.rooms_df = pd.concat([self.rooms_df, new_room], ignore_index=True)
        self._save_rooms()
        return {"id": room_id, "name": name, "created_at": created_at}

    def save_message(self, room_id: str, user_id: str, username: str, content: str, subtype: str = "text") -> Dict:
        msg_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        new_msg = pd.DataFrame([{
            "id": msg_id,
            "room_id": room_id,
            "user_id": user_id,
            "username": username,
            "content": content,
            "subtype": subtype,
            "timestamp": timestamp
        }])
        self.messages_df = pd.concat([self.messages_df, new_msg], ignore_index=True)
        self._save_messages()
        return {
            "id": msg_id,
            "room_id": room_id,
            "user_id": user_id,
            "username": username,
            "content": content,
            "subtype": subtype,
            "timestamp": timestamp
        }

    def get_room_messages(self, room_id: str, limit: int = 50) -> List[Dict]:
        msgs = self.messages_df[self.messages_df["room_id"] == room_id].sort_values("timestamp", ascending=False).head(limit)
        return msgs.sort_values("timestamp").to_dict("records")

    def create_study_session(self, user_id: str, room_id: str, start_time: datetime, end_time: datetime, duration: int) -> Dict:
        session_id = str(uuid.uuid4())
        new_session = pd.DataFrame([{
            "id": session_id,
            "user_id": user_id,
            "room_id": room_id,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "duration_seconds": duration
        }])
        self.sessions_df = pd.concat([self.sessions_df, new_session], ignore_index=True)
        self._save_sessions()
        return {
            "id": session_id,
            "user_id": user_id,
            "room_id": room_id,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "duration_seconds": duration
        }

    def get_user_sessions(self, user_id: str) -> List[Dict]:
        sessions = self.sessions_df[self.sessions_df["user_id"] == user_id].sort_values("start_time", ascending=False)
        return sessions.to_dict("records")

    def calculate_user_stats(self, user_id: str) -> Dict:
        sessions = self.get_user_sessions(user_id)
        
        total_seconds = sum(s.get("duration_seconds", 0) for s in sessions)
        total_hours = round(total_seconds / 3600, 1)
        total_sessions = len(sessions)
        
        today = datetime.now().date()
        today_seconds = sum(
            s.get("duration_seconds", 0) for s in sessions
            if datetime.fromisoformat(s["start_time"]).date() == today
        )
        today_minutes = round(today_seconds / 60)
        
        dates = sorted(set(datetime.fromisoformat(s["start_time"]).date() for s in sessions))
        streak = 0
        if dates:
            streak = 1
            current = dates[-1]
            for i in range(len(dates)-2, -1, -1):
                if (current - dates[i]).days == 1:
                    streak += 1
                    current = dates[i]
                else:
                    break
        
        last_7_days = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            day_seconds = sum(
                s.get("duration_seconds", 0) for s in sessions
                if datetime.fromisoformat(s["start_time"]).date() == day
            )
            last_7_days.append({
                "date": day.strftime("%Y-%m-%d"),
                "minutes": round(day_seconds / 60)
            })
        
        week_start = today - timedelta(days=today.weekday())
        week_seconds = sum(
            s.get("duration_seconds", 0) for s in sessions
            if datetime.fromisoformat(s["start_time"]).date() >= week_start
        )
        week_hours = round(week_seconds / 3600, 1)
        
        return {
            "total_hours": total_hours,
            "total_sessions": total_sessions,
            "today_minutes": today_minutes,
            "streak_days": streak,
            "last_7_days": last_7_days,
            "week_hours": week_hours
        }

    def get_user_calendar_events(self, user_id: str) -> List[Dict]:
        events = self.calendar_df[self.calendar_df["user_id"] == user_id].sort_values("date")
        return events.to_dict("records")

    def create_calendar_event(self, user_id: str, title: str, date: str, description: str = "") -> Dict:
        event_id = str(uuid.uuid4())
        created_at = datetime.now().isoformat()
        new_event = pd.DataFrame([{
            "id": event_id,
            "user_id": user_id,
            "title": title,
            "date": date,
            "description": description,
            "created_at": created_at
        }])
        self.calendar_df = pd.concat([self.calendar_df, new_event], ignore_index=True)
        self._save_calendar()
        return {
            "id": event_id,
            "user_id": user_id,
            "title": title,
            "date": date,
            "description": description,
            "created_at": created_at
        }

    def delete_calendar_event(self, event_id: str):
        self.calendar_df = self.calendar_df[self.calendar_df["id"] != event_id]
        self._save_calendar()