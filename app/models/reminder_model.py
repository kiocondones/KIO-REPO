from app import db
from enum import Enum
from sqlalchemy import Enum as SQLEnum
from sqlalchemy import CheckConstraint
from datetime import datetime, timezone

class ReminderPriority(Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

class Reminder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(
        db.Integer,
        db.ForeignKey("account.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        default=1,
    )
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    reminder_type = db.Column(db.String(100), nullable=False)
    target_type = db.Column(db.String(100), nullable=False)

    priority = db.Column(
        SQLEnum(ReminderPriority, values_callable=lambda x: [e.value for e in x]),
        nullable=False
    )

    scheduled_at = db.Column(db.DateTime(timezone=True), nullable=False)
    all_day_event = db.Column(db.Boolean, nullable=False, default=False)
    repeat_reminder = db.Column(db.Boolean, nullable=False, default=False)

    target_user_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id", ondelete="SET NULL"),
        nullable=True
    )

    target_department_id = db.Column(
        db.Integer,
        db.ForeignKey("department.department_id", ondelete="SET NULL"),
        nullable=True
    )

    target_ticket_id = db.Column(
        db.String(100),
        db.ForeignKey("ticket.id", ondelete="CASCADE"),
        nullable=True
    )

    target_task_id = db.Column(
        db.Integer,
        db.ForeignKey("task.id", ondelete="CASCADE"),
        nullable=True
    )

    target_user = db.relationship("User", back_populates="reminders")
    target_department = db.relationship("Department", back_populates="reminders")
    target_ticket = db.relationship("Ticket", back_populates="reminders")
    target_task = db.relationship("Task", back_populates="reminders")
    
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "reminder_type": self.reminder_type,
            "schedules_at": self.scheduled_at.isoformat(),
            "scheduled_at": self.scheduled_at.isoformat(),
            "priority": self.priority.value,
            "all_day_event": self.all_day_event,
            "repeat_reminder": self.repeat_reminder
        }
        
    def send_reminder(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "scheduled_at": self.scheduled_at.isoformat(),
        }

    def update_reminder(self, title, description, reminder_type, priority, scheduled_at):
        self.title = title
        self.description = description
        self.reminder_type = reminder_type
        self.priority = priority
        self.scheduled_at = scheduled_at


