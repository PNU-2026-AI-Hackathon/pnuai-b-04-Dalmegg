from collections import defaultdict

from fastapi import WebSocket


class ChatConnectionManager:
    def __init__(self) -> None:
        self.active_connections: dict[int, dict[str, set[WebSocket]]] = defaultdict(
            lambda: {"user": set(), "admin": set()}
        )

    async def connect(self, room_id: int, role: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections[room_id][role].add(websocket)

    def disconnect(self, room_id: int, role: str, websocket: WebSocket) -> None:
        self.active_connections[room_id][role].discard(websocket)
        if not self.active_connections[room_id]["user"] and not self.active_connections[room_id]["admin"]:
            self.active_connections.pop(room_id, None)

    def has_recipient(self, room_id: int, sender_role: str) -> bool:
        recipient_role = "admin" if sender_role == "user" else "user"
        return bool(self.active_connections[room_id][recipient_role])

    async def broadcast(self, room_id: int, payload: dict) -> None:
        connections = [
            websocket
            for role_connections in self.active_connections[room_id].values()
            for websocket in role_connections
        ]
        for websocket in connections:
            await websocket.send_json(payload)


chat_manager = ChatConnectionManager()
