from datetime import datetime, timezone
from enum import Enum
from sqlalchemy import Enum as SQLEnum

from app import db

class NotificationStatus(Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"


class NotificationType(Enum):
    MESSAGE = "message"
    ANNOUNCEMENT = "announcement"
    REMINDER = "reminder"
    NOTIFICATION = "notification"


class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(
        db.Integer,
        db.ForeignKey("account.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        default=1,
    )

    status = db.Column(
        SQLEnum(NotificationStatus),
        nullable=False,
        default=NotificationStatus.PENDING
    )

    notification_type = db.Column(
        SQLEnum(NotificationType),
        nullable=False
    )

    # ID of the source entity (Reminder ID, Announcement ID, etc.)
    source_id = db.Column(db.Integer, nullable=False)

    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)

    scheduled_at = db.Column(db.DateTime(timezone=True), nullable=True)

    target_user_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    is_read = db.Column(db.Boolean, nullable=False, default=False)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    def mark_success(self):
        self.status = NotificationStatus.SUCCESS

    def mark_failed(self):
        self.status = NotificationStatus.FAILED

    def to_payload(self):
        return {
            "notification_id": self.id,
            "type": self.notification_type.value,
            "source_id": self.source_id,
            "title": self.title,
            "description": self.description,
            "scheduled_at": (
                self.scheduled_at.isoformat() if self.scheduled_at else None
            )
        }

    def to_dict(self):
        return {
            "id": self.id,
            "status": self.status.value,
            "type": self.notification_type.value,
            "source_id": self.source_id,
            "title": self.title,
            "description": self.description,
            "scheduled_at": self.scheduled_at.isoformat() if self.scheduled_at else None,
            "target_user_id": self.target_user_id,
            "is_read": self.is_read,
            "isNew": not self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
