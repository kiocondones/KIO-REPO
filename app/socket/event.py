from flask_socketio import emit, join_room
from datetime import datetime

from .. import db
from ..models import Reminder, Notification, NotificationType, NotificationStatus

def register_socket_events(socketio):

    @socketio.on("connect")
    def on_connect(messages):
        room = f"user:1"
        join_room(room)
        
        print("Client connected:")
        print(messages)

    @socketio.on("message")
    def handle_message(msg):
        print("Received:", msg)
        emit("receive_message", f"Server received: {msg}")