
from typing import Dict, Set, List
from fastapi import WebSocket
import json
import logging

logger = logging.getLogger("studysync.ws")


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Dict[str, tuple]] = {}
        self.call_participants: Dict[str, Set[str]] = {}

    async def connect(self, websocket: WebSocket, room_id: str, user_id: str, username: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = {}
        self.active_connections[room_id][user_id] = (websocket, username)
        logger.info(f"Usuário {username} conectado na sala {room_id}")

    def disconnect(self, websocket: WebSocket, room_id: str, user_id: str):
        if room_id in self.active_connections:
            self.active_connections[room_id].pop(user_id, None)
            if not self.active_connections[room_id]:
                self.active_connections.pop(room_id, None)
        if room_id in self.call_participants:
            self.call_participants[room_id].discard(user_id)

    async def broadcast_to_room(self, room_id: str, message: dict):
        if room_id not in self.active_connections:
            return
        
        data = json.dumps(message)
        disconnected = []
        
        for user_id, (ws, username) in self.active_connections[room_id].items():
            try:
                await ws.send_text(data)
            except Exception as e:
                logger.error(f"Erro ao enviar para {username}: {e}")
                disconnected.append(user_id)
        
        for user_id in disconnected:
            self.disconnect(None, room_id, user_id)

    async def send_to_user(self, room_id: str, target_user_id: str, message: dict):
        if room_id not in self.active_connections:
            return
        if target_user_id not in self.active_connections[room_id]:
            return
        ws, _ = self.active_connections[room_id][target_user_id]
        try:
            await ws.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Erro ao enviar para usuário {target_user_id}: {e}")

    def get_room_users(self, room_id: str) -> List[dict]:
        if room_id not in self.active_connections:
            return []
        return [
            {"user_id": uid, "username": username}
            for uid, (_, username) in self.active_connections[room_id].items()
        ]

    def get_room_user_count(self, room_id: str) -> int:
        if room_id not in self.active_connections:
            return 0
        return len(self.active_connections[room_id])

    def add_to_call(self, room_id: str, user_id: str, username: str):
        if room_id not in self.call_participants:
            self.call_participants[room_id] = set()
        self.call_participants[room_id].add(user_id)
        logger.info(f"Usuário {username} entrou na chamada da sala {room_id}")

    def remove_from_call(self, room_id: str, user_id: str):
        if room_id in self.call_participants:
            self.call_participants[room_id].discard(user_id)
            if not self.call_participants[room_id]:
                self.call_participants.pop(room_id, None)

    def get_call_participants(self, room_id: str) -> List[dict]:
        if room_id not in self.call_participants:
            return []
        participants = []
        for uid in self.call_participants[room_id]:
            if room_id in self.active_connections and uid in self.active_connections[room_id]:
                _, username = self.active_connections[room_id][uid]
                participants.append({"user_id": uid, "username": username})
        return participants