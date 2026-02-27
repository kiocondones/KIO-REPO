from app import db
from datetime import datetime, timezone

class CheckList(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(
        db.Integer,
        db.ForeignKey("account.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        default=1,
    )
    name = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    is_completed = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    
    ticket_id = db.Column(db.String(100), db.ForeignKey("ticket.id"), nullable=False)
    ticket = db.relationship( "Ticket", back_populates="check_list" )
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "title": self.title,
            "description": self.description,
            "is_completed": self.is_completed,
            "isCompleted": self.is_completed,
        }
        
    def update_checklist(self, name, title, description, is_completed):
        self.name = name
        self.title = title
        self.description = description
        self.is_completed = is_completed