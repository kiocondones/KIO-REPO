from datetime import datetime, timezone

from app import db

class Resolution(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(
        db.Integer,
        db.ForeignKey("account.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        default=1,
    )
    description = db.Column(db.Text, nullable=False)
    is_draft = db.Column(db.Boolean, default=False)
    
    ticket_id = db.Column(db.String(100), db.ForeignKey("ticket.id"), nullable=False)
    ticket = db.relationship( "Ticket", back_populates="resolution" )
    
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
            "content": self.description,
            "author": "John Doe",
            "createdAt": self.created_at.isoformat(),
            "isDraft": self.is_draft
        }   