from app import db
from datetime import datetime, timezone

class Task(db.Model):
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
    type = db.Column(db.String(50), nullable=True)
    provider = db.Column(db.String(255), nullable=True)
    service = db.Column(db.String(255), nullable=True)
    issue = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(50), default="pending", nullable=True)

    due_at = db.Column(db.DateTime(timezone=True), nullable=False)
    is_completed = db.Column(db.Boolean, default=False, nullable=False)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    assigned_to_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    assigned_to = db.relationship("User")
    
    ticket_id = db.Column(db.String(10), db.ForeignKey("ticket.id"), nullable=False)
    ticket = db.relationship("Ticket", back_populates="tasks")
    
    reminders = db.relationship(
        "Reminder",
        back_populates="target_task",
    )
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "type": self.type,
            "provider": self.provider,
            "service": self.service,
            "issue": self.issue,
            "status": self.status or "pending",
            "assignedTo": self.assigned_to.name if self.assigned_to else "",
            "completed": self.is_completed,
            "isCompleted": self.is_completed,
        }
        
    def update_task(self, title, description, is_completed):
        self.title = title
        self.description = description
        self.is_completed = is_completed