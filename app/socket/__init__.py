from flask_socketio import SocketIO

# Use threading mode to avoid eventlet issues on Windows
socketio = SocketIO(cors_allowed_origins="*", async_mode='threading')

from .event import register_socket_events
from .send_reminder import send_reminder
from .emit_notification import emit_notification

register_socket_events(socketio)