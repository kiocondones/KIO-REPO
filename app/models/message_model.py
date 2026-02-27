from app import db
from datetime import datetime, timezone

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(
        db.Integer,
        db.ForeignKey("account.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        default=1,
    )

    sender_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id"),
        nullable=False,
        index=True
    )

    recipient_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id"),
        nullable=False,
        index=True
    )

    subject = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_draft = db.Column(db.Boolean, default=False)

    sender = db.relationship(
        "User",
        foreign_keys=[sender_id],
        back_populates="sent_messages"
    )

    recipient = db.relationship(
        "User",
        foreign_keys=[recipient_id],
        back_populates="received_messages"
    )

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
            "subject": self.subject,
            "message": self.message,
            "is_draft": self.is_draft,
            "sender": {
                "id": self.sender.id,
                "name": self.sender.name
            },
            "recipient": {
                "id": self.recipient.id,
                "name": self.recipient.name
            },
            "created_at": self.created_at.isoformat()
        }
        
    def message_preview(self):
        return {
            "id": self.id,
            "subject": self.subject,
            "recipient": self.recipient.name,
            "createdAt": self.created_at
        }
