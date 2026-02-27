from .. import db
from ..models import NotificationStatus
from . import socketio

def emit_notification(event, notification, room):
    """
    Emit a notification to a specific room/user and update status on acknowledgment.
    """
    def ack_callback():
        if notification.status != NotificationStatus.SUCCESS:
            notification.status = NotificationStatus.SUCCESS
            db.session.commit()

            socketio.emit("success", room=room)

    socketio.emit(
        event,
        notification.to_payload(),
        room=room,
        callback=ack_callback
    )
