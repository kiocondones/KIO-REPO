from app import db
from datetime import datetime, timezone

class History(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(
        db.Integer,
        db.ForeignKey("account.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        default=1,
    )
    action = db.Column(db.Text, nullable=False)
    details = db.Column(db.Text, nullable=True)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    ticket_id = db.Column(db.String(10), db.ForeignKey("ticket.id"), nullable=False, index=True)
    ticket = db.relationship("Ticket", back_populates="history")

    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True, index=True)
    user = db.relationship("User")

    account = db.relationship("Account")
    
    def to_dict(self):
        return {
            "id": self.id,
            "action": self.action,
            "details": self.details,
            "message": self.details,
            "actor": self.user.name if self.user else "System",
            "timestamp": self.created_at.isoformat(),
        }