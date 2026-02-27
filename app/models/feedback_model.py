from app import db
from datetime import datetime, timezone
from sqlalchemy import CheckConstraint

class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(
        db.Integer,
        db.ForeignKey("account.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        default=1,
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id"),
        nullable=False,
    )
    
    ticket_id = db.Column(
        db.String(10),
        db.ForeignKey("ticket.id"),
        nullable=False,
    )
    
    ticket = db.relationship(
        "Ticket",
        back_populates="feedback",
    )
    
    user = db.relationship(
        "User",
        back_populates="feedbacks"
    )

    rating = db.Column(
        db.Integer,
        nullable=False
    )

    comment = db.Column(db.Text, nullable=True)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="rating_range"),
        db.UniqueConstraint("ticket_id", name="uq_feedback_ticket_id"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "ticket_id": self.ticket_id,
            "user_id": self.user_id,
            "rating": self.rating,
            "comment": self.comment,
            "created_at": self.created_at.isoformat()
        }