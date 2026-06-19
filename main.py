import asyncio
import hashlib
import json
import re
import logging
import pathlib
import uuid
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Dict, List, Optional, Set
from dataclasses import dataclass, field, asdict
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Body, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from ai_routes import router as ai_router


from livekit import api as livekit_api
import os

try:
    import cohere
    COHERE_AVAILABLE = True
except ImportError:
    COHERE_AVAILABLE = False
    logger_tmp = logging.getLogger("studysync")
    logger_tmp.warning("  pacote cohere não instalado. Execute: pip install cohere")

LIVEKIT_URL = os.getenv("LIVEKIT_URL", "")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY", "")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET", "")
COHERE_API_KEY = os.getenv("COHERE_API_KEY", "")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("studysync")




@dataclass
class User:
    id: str
    username: str
    email: str = ""
    password_hash: Optional[str] = None
    role: str = "aluno"
    avatar: str = "🦊"
    area: str = ""
    bio: str = ""
    goal_minutes: int = 60
    subject_goals: Dict[str, int] = field(default_factory=dict) 
    flashcards: List[dict] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())


@dataclass
class Room:
    id: str
    name: str
    password_hash: Optional[str] = None
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())


@dataclass
class Message:
    id: str
    room_id: str
    user_id: str
    username: str
    content: str
    subtype: str
    reactions: Dict[str, List[str]] = field(default_factory=dict) # { emoji: [usernames] }
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())


@dataclass
class CalendarEvent:
    id: str
    user_id: str
    title: str
    date: str
    description: str
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())


@dataclass
class StudySession:
    id: str
    user_id: str
    room_id: str
    start_time: str
    end_time: str
    duration_seconds: int


@dataclass
class PrivateMessage:
    id: str
    from_id: str
    to_id: str
    from_name: str
    content: str
    subtype: str = "text"
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())


@dataclass
class Turma:
    id: str
    name: str
    description: str
    icon: str
    code: str
    professor_id: str
    professor_name: str = ""
    students: List[dict] = field(default_factory=list)
    materias: List[dict] = field(default_factory=list)
    videos: List[dict] = field(default_factory=list)
    avisos: List[dict] = field(default_factory=list)
    exercicios: List[dict] = field(default_factory=list)
    createdAt: str = field(default_factory=lambda: datetime.now().isoformat())



DATA_FILE = pathlib.Path("data/studysync_data.json")
TURMAS_FILE = pathlib.Path("data/turmas.json")
GLOBAL_EXERCISES_FILE = pathlib.Path("data/global_exercises.json")

def _hash_password(password: str) -> str:
    return hashlib.sha256(password.strip().encode()).hexdigest()


class MemoryDatabase:
    def __init__(self):
        self.users: Dict[str, User] = {}
        self.rooms: Dict[str, Room] = {}
        self.messages: Dict[str, Message] = {}
        self.calendar_events: Dict[str, CalendarEvent] = {}
        self.study_sessions: Dict[str, StudySession] = {}
        self.turmas: Dict[str, Turma] = {}
        self.private_messages: List[PrivateMessage] = []
        self.global_exercises: List[dict] = []

        self.load_data() 
        self._init_default_data() 

    def _init_default_data(self):
        
        if not self.rooms:
            default_rooms = [
                "📚 Matemática - Enem", "💻 Programação Web", "🧪 Química Orgânica",
                "🎨 Design UI/UX", "📖 Português - Redação", "🔬 Física - Mecânica"
            ]
            for room_name in default_rooms:
                room_id = str(uuid.uuid4())
                self.rooms[room_id] = Room(id=room_id, name=room_name)
            logger.info(f"✅ {len(self.rooms)} salas criadas")

    def _save_to_file(self):
        
        data = {
            "users": {uid: asdict(u) for uid, u in self.users.items()},
            "rooms": {rid: asdict(r) for rid, r in self.rooms.items()},
            "messages": {mid: asdict(m) for mid, m in self.messages.items()},
            "calendar_events": {eid: asdict(e) for eid, e in self.calendar_events.items()},
            "study_sessions": {sid: asdict(s) for sid, s in self.study_sessions.items()},
        }
        data["private_messages"] = [asdict(m) for m in self.private_messages]
        try:
            with open(DATA_FILE, 'w', encoding='utf-8') as f:  # Add encoding
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"Erro ao salvar dados principais: {e}")

        turmas_data = {"turmas": [asdict(t) for t in self.turmas.values()]}
        try:
            with open(TURMAS_FILE, 'w', encoding='utf-8') as f:  # Add encoding
                json.dump(turmas_data, f, indent=2)
        except Exception as e:
            logger.error(f"Erro ao salvar turmas: {e}")

        
        try:
            with open(GLOBAL_EXERCISES_FILE, 'w', encoding='utf-8') as f:
                json.dump({"exercises": self.global_exercises}, f, indent=2)
        except Exception as e:
            logger.error(f"Erro ao salvar banco global: {e}")

    def load_data(self):
      
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:  
                data = json.load(f)
            self.users = {uid: User(**u) for uid, u in data.get("users", {}).items()}
            self.rooms = {rid: Room(**r) for rid, r in data.get("rooms", {}).items()}
            self.messages = {mid: Message(**m) for mid, m in data.get("messages", {}).items()}
            self.calendar_events = {eid: CalendarEvent(**e) for eid, e in data.get("calendar_events", {}).items()}
            self.study_sessions = {sid: StudySession(**s) for sid, s in data.get("study_sessions", {}).items()}
            self.private_messages = [PrivateMessage(**m) for m in data.get("private_messages", [])]
        except FileNotFoundError:
            logger.info("Arquivo de dados principais não encontrado, inicializando vazio.")
        except json.JSONDecodeError as e:
            logger.error(f"Erro ao decodificar JSON de dados principais: {e}. Inicializando vazio.")

      
        try:
            with open(TURMAS_FILE, 'r', encoding='utf-8') as f:  # Add encoding
                data = json.load(f)
            self.turmas = {t["id"]: Turma(**t) for t in data.get("turmas", [])}
        except FileNotFoundError:
            logger.info("Arquivo de turmas não encontrado, inicializando vazio.")
            self.turmas = {}
        except json.JSONDecodeError as e:
            logger.error(f"Erro ao decodificar JSON de turmas: {e}. Inicializando vazio.")
            self.turmas = {}

       
        try:
            with open(GLOBAL_EXERCISES_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
            self.global_exercises = data.get("exercises", [])
        except FileNotFoundError:
            self.global_exercises = []

        logger.info(f"✅ Dados carregados: {len(self.users)} usuários, {len(self.rooms)} salas, {len(self.turmas)} turmas")


    def get_user_by_id(self, user_id: str) -> Optional[dict]:
        user = self.users.get(user_id)
        return self._safe_user_dict(user) if user else None

    def get_user_by_username(self, username: str) -> Optional[dict]:
        for user in self.users.values():
            if user.username.lower() == username.lower():
                return self._safe_user_dict(user)
        return None

    def get_user_by_email(self, email: str) -> Optional[dict]:
        for user in self.users.values():
            if user.email and user.email.lower() == email.lower():
                return self._safe_user_dict(user)
        return None

    def _get_raw_user_by_username(self, username: str) -> Optional[User]:
        for user in self.users.values():
            if user.username.lower() == username.lower():
                return user
        return None

    def _get_raw_user_by_email(self, email: str) -> Optional[User]:
        for user in self.users.values():
            if user.email and user.email.lower() == email.lower():
                return user
        return None

    def _safe_user_dict(self, user: User) -> dict:
        data = asdict(user)
        data.pop('password_hash', None)
        return data

    def create_user(self, username: str) -> dict:
        user_id = str(uuid.uuid4())
        user = User(id=user_id, username=username)
        self.users[user_id] = user
        self._save_to_file()
        return self._safe_user_dict(user)

    def update_user_goals(self, user_id: str, goals: dict):
        user = self.users.get(user_id)
        if not user:
            return None
        user.subject_goals = goals
        user.goal_minutes = sum(goals.values()) if goals else user.goal_minutes
        self._save_to_file()
        return self._safe_user_dict(user)

    def save_flashcards(self, user_id: str, flashcards: list):
        user = self.users.get(user_id)
        if not user:
            return False
        user.flashcards = flashcards
        self._save_to_file()
        return True

    def get_flashcards(self, user_id: str) -> list:
        user = self.users.get(user_id)
        if not user:
            return []
        return getattr(user, 'flashcards', [])

    def register_user(self, username: str, password: str, role: str = "aluno",
                      email: str = "", avatar: str = "🦊", area: str = "",
                      bio: str = "", goal_minutes: int = 60) -> dict:
        user_id = str(uuid.uuid4())
        user = User(
            id=user_id, username=username, email=email,
            password_hash=_hash_password(password), role=role, avatar=avatar,
            area=area, bio=bio, goal_minutes=goal_minutes,
        )
        self.users[user_id] = user
        self._save_to_file()
        return self._safe_user_dict(user)

    def authenticate_user(self, identifier: str, password: str) -> Optional[dict]:
        raw = self._get_raw_user_by_username(identifier)
        if not raw and "@" in identifier:
            raw = self._get_raw_user_by_email(identifier)
        if not raw or not raw.password_hash:
            return None
        if raw.password_hash != _hash_password(password):
            return None
        return self._safe_user_dict(raw)

    def get_all_rooms(self) -> List[dict]:
        result = []
        for room in self.rooms.values():
            data = asdict(room)
            data["has_password"] = bool(data.get("password_hash"))
            data.pop("password_hash", None)
            result.append(data)
        return result

    def get_room_by_id(self, room_id: str) -> Optional[dict]:
        room = self.rooms.get(room_id)
        if not room:
            return None
        data = asdict(room)
        data["has_password"] = bool(data.get("password_hash"))
        data.pop("password_hash", None)
        return data

    def create_room(self, name: str, password: Optional[str] = None) -> dict:
        room_id = str(uuid.uuid4())
        password_hash = None
        if password and password.strip():
            password_hash = hashlib.sha256(password.strip().encode()).hexdigest()
        room = Room(id=room_id, name=name, password_hash=password_hash)
        self.rooms[room_id] = room
        self._save_to_file()
        data = asdict(room)
        data["has_password"] = bool(password_hash)
        data.pop("password_hash", None)
        return data

    def verify_room_password(self, room_id: str, password: str) -> bool:
        room = self.rooms.get(room_id)
        if not room or not room.password_hash:
            return True if not room else False
        return room.password_hash == hashlib.sha256(password.strip().encode()).hexdigest()

   
    def save_message(self, room_id: str, user_id: str, username: str, content: str, subtype: str) -> dict:
        msg_id = str(uuid.uuid4())
        message = Message(id=msg_id, room_id=room_id, user_id=user_id,
                          username=username, content=content, subtype=subtype, reactions={})
        self.messages[msg_id] = message
        return asdict(message)

    def get_room_messages(self, room_id: str, limit: int = 50) -> List[dict]:
        msgs = [asdict(msg) for msg in self.messages.values() if msg.room_id == room_id]
        msgs.sort(key=lambda x: x["timestamp"])
        return msgs[:limit]

    def add_reaction(self, message_id: str, username: str, emoji: str):
        msg = self.messages.get(message_id)
        if not msg: return None
        
        if emoji not in msg.reactions:
            msg.reactions[emoji] = []
        
        if username in msg.reactions[emoji]:
            msg.reactions[emoji].remove(username)
            if not msg.reactions[emoji]:
                del msg.reactions[emoji]
        else:
            msg.reactions[emoji].append(username)
            
        self._save_to_file()
        return msg.reactions

    def get_user_calendar_events(self, user_id: str) -> List[dict]:
        return [asdict(ev) for ev in self.calendar_events.values() if ev.user_id == user_id]

    def create_calendar_event(self, user_id: str, title: str, date: str, description: str = "") -> dict:
        event_id = str(uuid.uuid4())
        event = CalendarEvent(id=event_id, user_id=user_id, title=title, date=date, description=description)
        self.calendar_events[event_id] = event
        self._save_to_file()
        return asdict(event)

    def delete_calendar_event(self, event_id: str) -> bool:
        if event_id in self.calendar_events:
            del self.calendar_events[event_id]
            self._save_to_file()
            return True
        return False

    def create_study_session(self, user_id: str, room_id: str, start_time: datetime,
                             end_time: datetime, duration_seconds: int) -> dict:
        session_id = str(uuid.uuid4())
        session = StudySession(id=session_id, user_id=user_id, room_id=room_id,
                               start_time=start_time.isoformat(), end_time=end_time.isoformat(),
                               duration_seconds=duration_seconds)
        self.study_sessions[session_id] = session
        self._save_to_file()
        return asdict(session)

    def save_private_message(self, from_id: str, to_id: str, from_name: str, content: str, subtype: str = "text"):
        pm = PrivateMessage(id=str(uuid.uuid4()), from_id=from_id, to_id=to_id, from_name=from_name, content=content, subtype=subtype)
        self.private_messages.append(pm)
        self._save_to_file()
        return asdict(pm)

    def get_private_history(self, user1: str, user2: str, limit: int = 50):
        relevant = [asdict(m) for m in self.private_messages 
                   if (m.from_id == user1 and m.to_id == user2) or (m.from_id == user2 and m.to_id == user1)]
        relevant.sort(key=lambda x: x["timestamp"])
        return relevant[-limit:]

    def get_private_contacts(self, user_id: str) -> List[dict]:
        contacts = {}
      
        for m in self.private_messages:
            other_id = m.to_id if m.from_id == user_id else (m.from_id if m.to_id == user_id else None)
            if not other_id: continue
            
        
            if other_id not in contacts or m.timestamp > contacts[other_id]["last_msg_time"]:
                other_user = self.users.get(other_id)
                if other_user:
                    contacts[other_id] = {
                        "id": other_id,
                        "username": other_user.username,
                        "last_msg_time": m.timestamp
                    }
        
        result = list(contacts.values())
        result.sort(key=lambda x: x["last_msg_time"], reverse=True)
        return result

    def get_user_sessions(self, user_id: str) -> List[dict]:
        return [asdict(s) for s in self.study_sessions.values() if s.user_id == user_id]

    def _generate_code(self) -> str:
        import random, string
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            if not any(t.code == code for t in self.turmas.values()):
                return code

    def create_turma(self, professor_id: str, professor_name: str, name: str,
                     description: str = "", icon: str = "🏫") -> dict:
        turma_id = str(uuid.uuid4())
        turma = Turma(
            id=turma_id, name=name, description=description, icon=icon,
            code=self._generate_code(), professor_id=professor_id,
            professor_name=professor_name, students=[], materias=[], videos=[]
        )
        self.turmas[turma_id] = turma
        self._save_to_file()
        return asdict(turma)

    def get_turmas_for_user(self, user_id: str, role: str) -> List[dict]:
        result = []
        for turma in self.turmas.values():
            if role == "professor" and turma.professor_id == user_id:
                result.append(asdict(turma))
            elif role != "professor" and any(s.get("id") == user_id for s in turma.students):
                result.append(asdict(turma))
        return result

    def get_turma_by_id(self, turma_id: str):
        for t in self.turmas.values():  
            if t.id == turma_id:
                return asdict(t) 
        return None

    def get_turma_by_code(self, code: str) -> Optional[Turma]:
        for t in self.turmas.values():
            if t.code == code:
                return t
        return None

    def add_student_to_turma(self, turma_id: str, user_id: str, username: str, email: str = "") -> bool:
        t = self.turmas.get(turma_id)
        if not t:
            return False
        if not any(s.get("id") == user_id for s in t.students):
            t.students.append({"id": user_id, "username": username, "email": email, "joinedAt": datetime.now().isoformat()})
            self._save_to_file()
        return True

    def add_materia(self, turma_id: str, name: str) -> Optional[dict]:
        t = self.turmas.get(turma_id)
        if not t:
            return None
        materia = {"id": str(uuid.uuid4()), "name": name, "icon": "📖"}
        t.materias.append(materia)
        self._save_to_file()
        return materia

    def add_video(self, turma_id: str, video_data: dict) -> Optional[dict]:
        t = self.turmas.get(turma_id)
        if not t:
            return None
        video = {"id": str(uuid.uuid4()), "createdAt": datetime.now().isoformat(), **video_data}
        t.videos.append(video)
        self._save_to_file()
        return video

    def add_aviso(self, turma_id: str, aviso_data: dict) -> Optional[dict]:
        t = self.turmas.get(turma_id)
        if not t:
            return None
        aviso = {"id": str(uuid.uuid4()), "createdAt": datetime.now().isoformat(), **aviso_data}
        t.avisos.append(aviso)
        self._save_to_file()
        return aviso

    def add_exercicio(self, turma_id: str, exercicio_data: dict) -> Optional[dict]:
        t = self.turmas.get(turma_id)
        if not t:
            return None
        exercicio = {"id": str(uuid.uuid4()), "createdAt": datetime.now().isoformat(), **exercicio_data}
        t.exercicios.append(exercicio)
        self._save_to_file()
        return exercicio

    def share_exercise(self, exercicio: dict, professor_name: str):
    
        shared_ex = exercicio.copy()
        shared_ex["respostas"] = {}
        shared_ex["shared_by"] = professor_name
        self.global_exercises.append(shared_ex)
        self._save_to_file()

    def calculate_user_stats(self, user_id: str) -> dict:
        sessions = [s for s in self.study_sessions.values() if s.user_id == user_id]
        total_seconds = sum(s.duration_seconds for s in sessions)
        total_hours = round(total_seconds / 3600, 1)
        week_ago = datetime.now().timestamp() - (7 * 24 * 3600)
        week_seconds = sum(s.duration_seconds for s in sessions
                          if datetime.fromisoformat(s.start_time).timestamp() > week_ago)
        week_hours = round(week_seconds / 3600, 1)
        today_start = datetime.now().replace(hour=0, minute=0, second=0).timestamp()
        today_seconds = sum(s.duration_seconds for s in sessions
                           if datetime.fromisoformat(s.start_time).timestamp() > today_start)
        streak = len(set(s.start_time.split("T")[0] for s in sessions[-7:])) if sessions else 0
        last_7_days = []
        for i in range(6, -1, -1):
            day = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            day = day.timestamp() - (i * 86400)
            day_seconds = sum(s.duration_seconds for s in sessions
                             if datetime.fromisoformat(s.start_time).timestamp() > day and
                                datetime.fromisoformat(s.start_time).timestamp() < day + 86400)
            last_7_days.append({
                "date": datetime.fromtimestamp(day).strftime("%Y-%m-%d"),
                "minutes": round(day_seconds / 60)
            })
        return {
            "total_hours": total_hours, "week_hours": week_hours,
            "today_minutes": round(today_seconds / 60), "streak_days": streak,
            "total_sessions": len(sessions), "last_7_days": last_7_days
        }


db = MemoryDatabase()
manager = None



class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        self.user_info: Dict[str, dict] = {}
        self.call_participants: Dict[str, Set[str]] = {}

    async def connect(self, websocket: WebSocket, room_id: str, user_id: str, username: str):
        if room_id not in self.active_connections:
            self.active_connections[room_id] = {}
        self.active_connections[room_id][user_id] = websocket
        self.user_info[user_id] = {"username": username, "room_id": room_id}

    def disconnect(self, websocket: WebSocket, room_id: str, user_id: str):
        if room_id in self.active_connections:
            self.active_connections[room_id].pop(user_id, None)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]
        self.user_info.pop(user_id, None)
        self.remove_from_call(room_id, user_id)

    async def broadcast_to_room(self, room_id: str, message: dict, exclude_user_id: str = None):
        if room_id not in self.active_connections:
            return
        for user_id, connection in self.active_connections[room_id].items():
            if user_id != exclude_user_id:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Erro ao enviar mensagem: {e}")

    def get_room_users(self, room_id: str) -> List[dict]:
        if room_id not in self.active_connections:
            return []
        return [{"user_id": uid, "username": self.user_info[uid]["username"]}
                for uid in self.active_connections[room_id] if uid in self.user_info]

    def get_room_user_count(self, room_id: str) -> int:
        return len(self.active_connections.get(room_id, {}))

    def add_to_call(self, room_id: str, user_id: str, username: str):
        if room_id not in self.call_participants:
            self.call_participants[room_id] = set()
        self.call_participants[room_id].add(user_id)

    def remove_from_call(self, room_id: str, user_id: str):
        if room_id in self.call_participants:
            self.call_participants[room_id].discard(user_id)

    def get_call_participants(self, room_id: str) -> List[dict]:
        if room_id not in self.call_participants:
            return []
        return [{"user_id": uid, "username": self.user_info[uid]["username"]}
                for uid in self.call_participants[room_id] if uid in self.user_info]

    async def send_to_user(self, room_id: str, target_user_id: str, message: dict):
      
        for rid, connections in self.active_connections.items():
            if target_user_id in connections:
                try:
                    await connections[target_user_id].send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Erro ao enviar para {target_user_id}: {e}")
                return  # encontrou e enviou




@asynccontextmanager
async def lifespan(app: FastAPI):
    global manager
    manager = ConnectionManager()
    logger.info(" StudySync iniciando...")
    yield
    logger.info(" StudySync encerrando...")


app = FastAPI(title="StudySync API", version="2.0.0", lifespan=lifespan)

app.include_router(ai_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app.mount("/static", StaticFiles(directory=os.path.join(_BASE_DIR, "static")), name="static")

@app.get("/")
async def root():
    return FileResponse(os.path.join(_BASE_DIR, "index.html"))

@app.get("/api/livekit-token")
async def get_livekit_token(room: str, username: str):
    if not (LIVEKIT_URL and LIVEKIT_API_KEY and LIVEKIT_API_SECRET):
        raise HTTPException(status_code=503, detail="LiveKit não configurado neste ambiente")

    token = (
        livekit_api.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
        .with_identity(username)
        .with_name(username)
        .with_grants(livekit_api.VideoGrants(
            room_join=True,
            room=room,
        ))
    )

    return {
        "url": LIVEKIT_URL,
        "token": token.to_jwt(),
    }
@app.post("/api/auth/register")
async def register(body: dict):
    username = (body.get("username") or "").strip()
    password = (body.get("password") or "").strip()
    role = (body.get("role") or "aluno").strip().lower()
    email = (body.get("email") or "").strip()
    avatar = (body.get("avatar") or "🦊").strip()
    area = (body.get("area") or "").strip()
    bio = (body.get("bio") or "").strip()
    goal_minutes = int(body.get("goal_minutes") or 60)

    if not username or len(username) < 2:
        raise HTTPException(status_code=400, detail="Nome de usuário deve ter pelo menos 2 caracteres.")
    if not password or len(password) < 6:
        raise HTTPException(status_code=400, detail="Senha deve ter pelo menos 6 caracteres.")
    if role not in ("aluno", "professor"):
        raise HTTPException(status_code=400, detail="Papel inválido.")

    if db.get_user_by_username(username):
        raise HTTPException(status_code=409, detail="Nome de usuário já está em uso.")
    if email and db.get_user_by_email(email):
        raise HTTPException(status_code=409, detail="E-mail já cadastrado.")

    user = db.register_user(username=username, password=password, role=role, email=email,
                            avatar=avatar, area=area, bio=bio, goal_minutes=goal_minutes)
    return {"status": "created", "user": user}


@app.post("/api/auth/login")
async def auth_login(body: dict):
    identifier = (body.get("identifier") or body.get("username") or "").strip()
    password = (body.get("password") or "").strip()

    if not identifier or not password:
        raise HTTPException(status_code=400, detail="Usuário/e-mail e senha são obrigatórios.")

    user = db.authenticate_user(identifier, password)
    if not user:
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos.")

    return {"status": "ok", "user": user}


@app.get("/api/auth/check-username")
async def check_username(username: str):
    return {"available": db.get_user_by_username(username) is None}


@app.get("/api/auth/check-email")
async def check_email(email: str):
    return {"available": db.get_user_by_email(email) is None}


@app.post("/api/users/{user_id}/goals")
async def update_goals(user_id: str, body: dict):
    goals = body.get("subject_goals", {})
    user = db.update_user_goals(user_id, goals)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return {"status": "updated", "user": user}


@app.get("/api/users/{user_id}/flashcards")
async def get_flashcards(user_id: str):
    cards = db.get_flashcards(user_id)
    return {"flashcards": cards}


@app.post("/api/users/{user_id}/flashcards")
async def save_flashcards(user_id: str, body: dict):
    flashcards = body.get("flashcards", [])
    ok = db.save_flashcards(user_id, flashcards)
    if not ok:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return {"status": "saved", "count": len(flashcards)}


@app.get("/api/users/by-username/{username}")
async def get_user_id_by_username(username: str):
    user = db.get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return user



@app.get("/api/rooms")
async def list_rooms():
    rooms = db.get_all_rooms()
    for room in rooms:
        room["online_count"] = manager.get_room_user_count(room["id"]) if manager else 0
    return {"rooms": rooms}


@app.post("/api/rooms")
async def create_room(room_data: dict):
    name = room_data.get("name")
    if not name:
        raise HTTPException(status_code=400, detail="Nome da sala é obrigatório")
    password = room_data.get("password")
    new_room = db.create_room(name, password)
    return {"status": "created", "room": new_room}


@app.get("/api/rooms/{room_id}/messages")
async def get_room_messages(room_id: str, limit: int = 50):
    return {"messages": db.get_room_messages(room_id, limit=limit)}


@app.get("/api/private-messages/{user_id}/{target_id}")
async def get_private_messages(user_id: str, target_id: str):
    return {"messages": db.get_private_history(user_id, target_id)}


@app.get("/api/private-contacts/{user_id}")
async def get_private_contacts(user_id: str):
    return {"contacts": db.get_private_contacts(user_id)}


@app.post("/api/rooms/{room_id}/verify-password")
async def verify_room_password(room_id: str, body: dict):
    room = db.rooms.get(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Sala não encontrada")
    if not room.password_hash:
        return {"ok": True}
    if not db.verify_room_password(room_id, body.get("password", "")):
        raise HTTPException(status_code=403, detail="Senha incorreta")
    return {"ok": True}



@app.get("/api/users/{user_id}/dashboard")
async def get_dashboard(user_id: str):
    user = db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return {"user": user, "sessions": db.get_user_sessions(user_id), "stats": db.calculate_user_stats(user_id)}


@app.get("/api/users/{user_id}/stats")
async def get_user_stats(user_id: str):
    user = db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return {"user": user, "stats": db.calculate_user_stats(user_id)}


@app.get("/api/users/{user_id}/calendar")
async def get_calendar_events(user_id: str):
    return {"events": db.get_user_calendar_events(user_id)}


@app.post("/api/users/{user_id}/calendar")
async def create_calendar_event(user_id: str, event_data: dict):
    title = event_data.get("title")
    date = event_data.get("date")
    if not title or not date:
        raise HTTPException(status_code=400, detail="Título e data são obrigatórios")
    new_event = db.create_calendar_event(user_id, title, date, event_data.get("description", ""))
    return {"status": "created", "event": new_event}


@app.delete("/api/calendar/{event_id}")
async def delete_calendar_event(event_id: str):
    if db.delete_calendar_event(event_id):
        return {"status": "deleted"}
    raise HTTPException(status_code=404, detail="Evento não encontrado")


@app.post("/api/users/{user_id}/sessions")
async def create_user_session(user_id: str, body: dict):
    user = db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    duration_seconds = int(body.get("duration_seconds", 0))
    if duration_seconds < 60:
        raise HTTPException(status_code=400, detail="Duração mínima de 60 segundos")
    end_time = datetime.now()
    start_time = datetime.fromtimestamp(end_time.timestamp() - duration_seconds)
    session = db.create_study_session(user_id, body.get("room_id", "focus"), start_time, end_time, duration_seconds)
    return {"status": "created", "session": session}


@app.get("/api/ranking")
async def get_ranking(period: str = "total"):
    ranking = []
    for user_id, user in db.users.items():
        stats = db.calculate_user_stats(user_id)
        ranking.append({
            "user_id": user_id, "username": user.username, "role": user.role,
            "avatar": user.avatar, "total_hours": stats["total_hours"],
            "week_hours": stats["week_hours"], "streak_days": stats["streak_days"],
            "total_sessions": stats["total_sessions"],
        })
    sort_key = "week_hours" if period == "week" else "total_hours"
    ranking.sort(key=lambda x: x[sort_key], reverse=True)
    for i, entry in enumerate(ranking):
        entry["position"] = i + 1
    return {"ranking": ranking[:50], "period": period}


@app.get("/api/turmas")
async def list_turmas(user_id: str):
    user = db.get_user_by_id(user_id)
    role = user.get("role", "aluno") if user else "aluno"  # Assume aluno se não encontrar
    turmas = db.get_turmas_for_user(user_id, role)
    return {"turmas": turmas}


@app.post("/api/turmas")
async def create_turma(body: dict):
    professor_id = (body.get("professor_id") or "").strip()
    professor_name = (body.get("professor_name") or "").strip()
    name = (body.get("name") or "").strip()
    description = (body.get("description") or "").strip()
    icon = (body.get("icon") or "🏫").strip()

    if not professor_id or not name:
        raise HTTPException(status_code=400, detail="professor_id e name são obrigatórios")

    user = db.get_user_by_id(professor_id)
    if not user or user.get("role") != "professor":
        raise HTTPException(status_code=403, detail="Apenas professores podem criar turmas")

    turma = db.create_turma(professor_id, professor_name or user.get("username", "Professor"), name, description, icon)
    return {"status": "created", "turma": turma}



@app.post("/api/turmas/join")
async def join_turma(body: dict):
    code = (body.get("code") or "").strip().upper()
    user_id = str(body.get("user_id") or "").strip()

    if not code or not user_id:
        raise HTTPException(status_code=400, detail=f"code: '{code}', user_id: '{user_id}' - ambos obrigatórios")

    user = db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    turma = db.get_turma_by_code(code)
    if not turma:
        raise HTTPException(status_code=404, detail="Código de turma inválido")

    db.add_student_to_turma(turma.id, user_id, user.get("username", "Aluno"), user.get("email", ""))
    return {"status": "joined", "turma": asdict(turma)}


@app.post("/api/turmas/entrar")
async def entrar_turma(body: dict = Body(...)):
   
    payload = body or {}
    logger.info(f"➡️ /api/turmas/entrar payload: {payload}")
    return await join_turma(payload)


@app.get("/api/turmas/{turma_id}")
def get_turma(turma_id: str):
    print(f"Buscando turma com ID: {turma_id}")
    turma = db.get_turma_by_id(turma_id)
    if not turma:
        print(f"Turma não encontrada: {turma_id}")
        raise HTTPException(status_code=404, detail="Turma não encontrada")
    print(f"Turma encontrada: {turma['name']}")
    return {"turma": turma}


@app.post("/api/turmas/{turma_id}/materias")
async def add_materia(turma_id: str, body: dict):
    name = (body.get("name") or "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="name é obrigatório")
    materia = db.add_materia(turma_id, name)
    if not materia:
        raise HTTPException(status_code=404, detail="Turma não encontrada")
    return {"status": "created", "materia": materia}


@app.post("/api/turmas/{turma_id}/videos")
async def add_video(turma_id: str, body: dict):
    title = (body.get("title") or "").strip()
    if not title:
        raise HTTPException(status_code=400, detail="title é obrigatório")
    video_data = {
        "title": title,
        "description": body.get("description", ""),
        "url": body.get("url", ""),
        "type": body.get("type", "youtube"),
        "fileData": body.get("fileData"),
        "fileName": body.get("fileName"),
        "mimeType": body.get("mimeType"),
    }
    video = db.add_video(turma_id, video_data)
    if not video:
        raise HTTPException(status_code=404, detail="Turma não encontrada")
    return {"status": "created", "video": video}


@app.post("/api/turmas/{turma_id}/avisos")
async def add_aviso(turma_id: str, body: dict):
    title = (body.get("title") or "").strip()
    content = (body.get("content") or "").strip()
    if not title or not content:
        raise HTTPException(status_code=400, detail="title e content são obrigatórios")
    aviso = db.add_aviso(turma_id, {"title": title, "content": content})
    if not aviso:
        raise HTTPException(status_code=404, detail="Turma não encontrada")
    return {"status": "created", "aviso": aviso}


@app.get("/api/turmas/{turma_id}/exercicios")
async def list_exercicios(turma_id: str):
    """Busca todos os exercícios de uma turma"""
    turma = db.get_turma_by_id(turma_id)
    if not turma:
        raise HTTPException(status_code=404, detail="Turma não encontrada")
    return {"exercicios": turma.get("exercicios", [])}


@app.post("/api/turmas/{turma_id}/exercicios")
async def add_exercicio(turma_id: str, body: dict):
    title = (body.get("title") or "").strip()
    description = (body.get("description") or "").strip()
    questions = body.get("questions", [])
    if not title:
        raise HTTPException(status_code=400, detail="title é obrigatório")
    materia = (body.get("materia") or "").strip()
    deadline = body.get("deadline")  # ISO string or None
    lim_tentativas = int(body.get("limTentativas") or 0)
    exercicio = db.add_exercicio(turma_id, {
        "title": title,
        "description": description,
        "questions": questions,
        "materia": materia,
        "deadline": deadline,
        "limTentativas": lim_tentativas,
    })
    if not exercicio:
        raise HTTPException(status_code=404, detail="Turma não encontrada")
    return {"status": "created", "exercicio": exercicio}


@app.get("/api/exercises/global")
async def list_global_exercises():
    return {"exercises": db.global_exercises}


@app.get("/api/banco-global")
async def get_banco_global():
    return {"questoes": db.global_exercises}


@app.post("/api/banco-global")
async def post_banco_global(item: dict = Body(...)):
    db.global_exercises.insert(0, item)
    db._save_to_file()
    return {"status": "ok"}


@app.post("/api/turmas/{turma_id}/exercicios/{ex_id}/share")
async def share_exercise_globally(turma_id: str, ex_id: str):
    turma = db.turmas.get(turma_id)
    if not turma:
        raise HTTPException(status_code=404, detail="Turma não encontrada")
    
    target_ex = next((ex for ex in turma.exercicios if ex["id"] == ex_id), None)
    if not target_ex:
        raise HTTPException(status_code=404, detail="Exercício não encontrado")
    
    db.share_exercise(target_ex, turma.professor_name)
    return {"status": "shared"}


@app.post("/api/turmas/{turma_id}/exercicios/import")
async def import_global_exercise(turma_id: str, body: dict):
    exercise_data = body.get("exercise")
    if not exercise_data:
        raise HTTPException(status_code=400, detail="Dados do exercício ausentes")
    new_ex = db.add_exercicio(turma_id, exercise_data)
    return {"status": "imported", "exercicio": new_ex}


@app.get("/api/turmas/{turma_id}/student-stats")
async def get_turma_student_stats(turma_id: str):
    turma = db.get_turma_by_id(turma_id)
    if not turma:
        raise HTTPException(status_code=404, detail="Turma não encontrada")
    
    results = []
    for student in turma.get("students", []):
        uid = student.get("id")
        stats = db.calculate_user_stats(uid)
        results.append({
            "id": uid,
            "username": student.get("username"),
            "stats": stats
        })
    return {"students": results}


@app.post("/api/turmas/{turma_id}/exercicios/{ex_id}/respostas")
async def submit_exercicio_resposta(turma_id: str, ex_id: str, body: dict):
    turma = db.turmas.get(turma_id)
    if not turma:
        raise HTTPException(status_code=404, detail="Turma não encontrada")
    
    target_ex = next((ex for ex in turma.exercicios if ex["id"] == ex_id), None)
    if not target_ex:
        raise HTTPException(status_code=404, detail="Exercício não encontrado")
    
    user_id = body.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id é obrigatório")
    
    if "respostas" not in target_ex:
        target_ex["respostas"] = {}
    
    lim_tentativas = target_ex.get("limTentativas", 0)
    user_entry = target_ex["respostas"].get(user_id, {})
    tentativas_feitas = user_entry.get("tentativas", 0)

    deadline = target_ex.get("deadline")
    if deadline:
        from datetime import timezone
       
        if "T" not in deadline: 
             deadline += "T23:59:59"
        dl = datetime.fromisoformat(deadline.replace("Z", "+00:00"))
        if datetime.now(timezone.utc) > dl:
            raise HTTPException(status_code=400, detail="Prazo do exercício encerrado.")

   
    if lim_tentativas > 0 and tentativas_feitas >= lim_tentativas:
        raise HTTPException(status_code=400, detail="Limite de tentativas atingido.")

    tentativa_atual = (tentativas_feitas or 0) + 1
    historico = user_entry.get("historico", [])
    historico.append({
        "tentativa": tentativa_atual,
        "respostas": body.get("respostas"),
        "concluidoAt": datetime.now().isoformat(),
    })

    target_ex["respostas"][user_id] = {
        "concluido": True,
        "tentativas": tentativa_atual,
        "respostas": body.get("respostas"),
        "ultimasRespostas": body.get("respostas"),
        "historico": historico,
        "concluidoAt": datetime.now().isoformat(),
        "username": body.get("username", "Aluno")
    }
    db._save_to_file()
    return {"status": "success"}


@app.post("/api/turmas/{turma_id}/exercicios/{ex_id}/corrigir")
async def corrigir_exercicio(turma_id: str, ex_id: str, body: dict):
    turma = db.turmas.get(turma_id)
    if not turma:
        raise HTTPException(status_code=404, detail="Turma não encontrada")
    
    target_ex = next((ex for ex in turma.exercicios if ex["id"] == ex_id), None)
    if not target_ex:
        raise HTTPException(status_code=404, detail="Exercício não encontrado")
    
    user_id = body.get("user_id")
    qi = str(body.get("qi"))
    if "respostas" not in target_ex or user_id not in target_ex["respostas"]:
        raise HTTPException(status_code=404, detail="Resposta do aluno não encontrada")
    
    respostas_aluno = target_ex["respostas"][user_id]["respostas"]
    if qi not in respostas_aluno:
        respostas_aluno[qi] = {}
        
    respostas_aluno[qi]["nota"] = body.get("nota")
    respostas_aluno[qi]["comentario"] = body.get("comentario")
    db._save_to_file()
    return {"status": "success"}




@app.websocket("/ws/global/{user_id}")
async def global_websocket_endpoint(websocket: WebSocket, user_id: str):

    await websocket.accept()
    user = db.get_user_by_id(user_id)
    if not user:
        await websocket.close(code=4004, reason="Usuário não encontrado")
        return

    GLOBAL_ROOM = "__global__"
    await manager.connect(websocket, GLOBAL_ROOM, user["id"], user["username"])
    logger.info(f"🌐 {user['username']} conectado ao canal global")

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
            except Exception:
                continue

            msg_type = data.get("type")

            if msg_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))

            elif msg_type == "private_message":
                target_id = data.get("target_id")
                content = data.get("content", "").strip()
                if not target_id or not content:
                    continue

                pm = db.save_private_message(user["id"], target_id, user["username"], content)

               
                await manager.send_to_user(GLOBAL_ROOM, target_id, {
                    "type": "private_message", **pm
                })
              
                await websocket.send_text(json.dumps({
                    "type": "private_message", **pm
                }))

    except WebSocketDisconnect:
        manager.disconnect(websocket, GLOBAL_ROOM, user["id"])
        logger.info(f"🌐 {user['username']} desconectado do canal global")


@app.websocket("/ws/{room_id}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, user_id: str):
    await websocket.accept()

    user = db.get_user_by_id(user_id)
    if not user:
        temp_username = f"Aluno_{user_id[:6]}"
        user = db.create_user(temp_username)

    room = db.get_room_by_id(room_id)
    if not room:
        await websocket.close(code=4004, reason="Sala não encontrada")
        return

    start_time = datetime.now()
    await manager.connect(websocket, room_id, user["id"], user["username"])
    logger.info(f"✅ {user['username']} entrou na sala {room['name']}")

    await manager.broadcast_to_room(room_id, {
        "type": "user_joined",
        "user_id": user["id"],
        "username": user["username"],
        "timestamp": datetime.now().isoformat(),
        "online_users": manager.get_room_users(room_id)
    })

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({"type": "error", "message": "JSON inválido"}))
                continue
            await handle_websocket_message(websocket, room_id, user["id"], user, data)

    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"Erro WebSocket: {e}")
    finally:
        manager.disconnect(websocket, room_id, user["id"])
        end_time = datetime.now()
        duration = int((end_time - start_time).total_seconds())
        if duration >= 60:
            db.create_study_session(user["id"], room_id, start_time, end_time, duration)
        await manager.broadcast_to_room(room_id, {
            "type": "user_left",
            "user_id": user["id"],
            "username": user["username"],
            "timestamp": datetime.now().isoformat(),
            "online_users": manager.get_room_users(room_id)
        })
        logger.info(f"👋 {user['username']} saiu da sala {room['name']} ({duration}s)")


async def handle_websocket_message(websocket, room_id, user_id, user, data):
    msg_type = data.get("type", "")

    if msg_type == "chat_message":
        content = data.get("content", "").strip()
        msg_subtype = data.get("subtype", "text")
        if not content and msg_subtype == "text":
            return
        saved = db.save_message(room_id, user_id, user["username"], content, msg_subtype)
        await manager.broadcast_to_room(room_id, {
            "type": "chat_message",
            "id": saved["id"],
            "user_id": user_id,
            "username": user["username"],
            "content": content,
            "subtype": msg_subtype,
            "timestamp": saved["timestamp"]
        })
    elif msg_type == "chat_reaction":
        msg_id = data.get("message_id")
        emoji = data.get("emoji")
        new_reactions = db.add_reaction(msg_id, user["username"], emoji) or {}
        await manager.broadcast_to_room(room_id, {
            "type": "chat_reaction",
            "message_id": msg_id,
            "reactions": new_reactions
        })
    elif msg_type == "private_message":
        target_id = data.get("target_id")
        content = data.get("content", "").strip()
        if not target_id or not content: return
        
        pm = db.save_private_message(user_id, target_id, user["username"], content)
        

        await manager.send_to_user(room_id, target_id, {
            "type": "private_message",
            **pm
        })
       
        await websocket.send_text(json.dumps({
            "type": "private_message", **pm
        }))
    elif msg_type == "focus_start":
        duration = data.get("duration", 25)
        await manager.broadcast_to_room(room_id, {
            "type": "focus_started",
            "duration_minutes": duration,
            "initiated_by": user["username"],
            "started_at": datetime.now().isoformat()
        })
    elif msg_type == "focus_end":
        await manager.broadcast_to_room(room_id, {
            "type": "focus_ended",
            "ended_by": user["username"],
            "timestamp": datetime.now().isoformat()
        })
    elif msg_type == "focus_tick":
        await manager.broadcast_to_room(room_id, {
            "type": "focus_tick",
            "remaining": data.get("remaining", 0),
            "phase": data.get("phase", "focus"),
            "initiated_by": user["username"]
        })
    elif msg_type == "whiteboard_draw":
        await manager.broadcast_to_room(room_id, {
            "type": "whiteboard_draw",
            "user_id": user_id,
            "username": user["username"],
            "seg": data.get("seg")
        })
    elif msg_type == "whiteboard_clear":
        await manager.broadcast_to_room(room_id, {
            "type": "whiteboard_clear",
            "user_id": user_id,
            "username": user["username"]
        })
    elif msg_type == "doc_update":
        await manager.broadcast_to_room(room_id, {
            "type": "doc_update",
            "user_id": user_id,
            "username": user["username"],
            "html": data.get("html", "")
        })
    elif msg_type == "call_wb_draw":
        await manager.broadcast_to_room(room_id, {
            "type": "call_wb_draw",
            "user_id": user_id,
            "username": user["username"],
            "seg": data.get("seg")
        })
    elif msg_type == "call_wb_clear":
        await manager.broadcast_to_room(room_id, {
            "type": "call_wb_clear",
            "user_id": user_id,
            "username": user["username"]
        })
    elif msg_type == "code_update":
        await manager.broadcast_to_room(room_id, {
            "type": "code_update",
            "user_id": user_id,
            "username": user["username"],
            "content": data.get("content", ""),
            "language": data.get("language", "javascript")
        })
    elif msg_type == "code_typing":
        await manager.broadcast_to_room(room_id, {
            "type": "code_typing",
            "user_id": user_id,
            "username": user["username"],
            "isTyping": data.get("isTyping", False)
        })
    elif msg_type == "pin_add":
        await manager.broadcast_to_room(room_id, {
            "type": "pin_add",
            "user_id": user_id,
            "username": user["username"],
            "pin": data.get("pin")
        })
    elif msg_type == "pin_delete":
        await manager.broadcast_to_room(room_id, {
            "type": "pin_delete",
            "user_id": user_id,
            "username": user["username"],
            "pinId": data.get("pinId")
        })
    elif msg_type == "node_add":
        await manager.broadcast_to_room(room_id, {
            "type": "node_add", "user_id": user_id, "username": user["username"], "node": data.get("node")
        })
    elif msg_type == "node_delete":
        await manager.broadcast_to_room(room_id, {
            "type": "node_delete", "user_id": user_id, "username": user["username"], "nodeId": data.get("nodeId")
        })
    elif msg_type == "node_move":
        await manager.broadcast_to_room(room_id, {
            "type": "node_move", "user_id": user_id, "nodeId": data.get("nodeId"),
            "x": data.get("x"), "y": data.get("y"), "content": data.get("content")
        })
    elif msg_type == "node_link_add":
        await manager.broadcast_to_room(room_id, {
            "type": "node_link_add", "link": data.get("link")
        })
    elif msg_type == "node_link_delete":
        await manager.broadcast_to_room(room_id, {
            "type": "node_link_delete", "linkId": data.get("linkId")
        })
    elif msg_type == "pdf_draw":
        await manager.broadcast_to_room(room_id, {
            "type": "pdf_draw", "user_id": user_id, "seg": data.get("seg")
        })
    elif msg_type == "pdf_page_sync":
        await manager.broadcast_to_room(room_id, {
            "type": "pdf_page_sync", "page": data.get("page"), "leader": user["username"]
        })
    elif msg_type == "leader_status":
        await manager.broadcast_to_room(room_id, {
            "type": "leader_status", "user_id": user_id, "active": data.get("active")
        })
    elif msg_type == "call_transcription":
      
        await manager.broadcast_to_room(room_id, {
            "type": "call_transcription", "username": user["username"], "text": data.get("text")
        })
    elif msg_type == "pin_move":
        await manager.broadcast_to_room(room_id, {
            "type": "pin_move",
            "user_id": user_id,
            "pinId": data.get("pinId"),
            "x": data.get("x"),
            "y": data.get("y")
        })
    elif msg_type == "call_join":
        manager.add_to_call(room_id, user_id, user["username"])
        await manager.broadcast_to_room(room_id, {
            "type": "call_updated",
            "participants": manager.get_call_participants(room_id)
        })
    elif msg_type == "call_leave":
        manager.remove_from_call(room_id, user_id)
        await manager.broadcast_to_room(room_id, {
            "type": "call_updated",
            "participants": manager.get_call_participants(room_id)
        })
    elif msg_type == "ping":
        await websocket.send_text(json.dumps({"type": "pong"}))
    else:
        logger.warning(f"Tipo de mensagem desconhecido: {msg_type}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
