from .. import db
from .emit_notification import emit_notification
from ..models import Notification, NotificationType, NotificationStatus

def send_reminder(reminder, user_id):
    notification = Notification(
        notification_type=NotificationType.REMINDER,
        source_id=reminder.id,
        title=reminder.title,
        description=reminder.description,
        scheduled_at=reminder.scheduled_at,
        target_user_id=user_id,
        status=NotificationStatus.PENDING,
        account_id=reminder.account_id,
    )
    
    db.session.add(notification)
    db.session.commit()

    emit_notification(
        "reminder",
        notification,
        room="room_1"
    )