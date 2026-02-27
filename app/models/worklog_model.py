from app import db
from datetime import datetime, timezone

class WorkLog(db.Model):
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

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    author_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    author = db.relationship("User")

    replies = db.relationship(
        "WorkLogMessage",
        back_populates="worklog",
        cascade="all, delete-orphan"
    )
    
    ticket_id = db.Column(db.String(10), db.ForeignKey("ticket.id"), nullable=False)
    ticket = db.relationship("Ticket", back_populates="work_logs")
    
    def to_dict(self):
        root_replies = [
            r.to_dict() for r in self.replies
            if r.parent_id is None
        ]
        
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "message": self.description,
            "author": self.author.name,
            "auhorInitials": self.author.initials,
            "timestamp": self.created_at.isoformat(),
            "time": self.created_at.isoformat(),
            "created_at": self.created_at.isoformat(),
            "replies": root_replies
        }
        
class WorkLogMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(
        db.Integer,
        db.ForeignKey("account.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        default=1,
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

    text = db.Column(db.Text, nullable=False)

    author_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    author = db.relationship("User")

    worklog_id = db.Column(db.Integer, db.ForeignKey("work_log.id"), nullable=False)
    worklog = db.relationship(
        "WorkLog",
        back_populates="replies"
    )

    # Reply parent
    parent_id = db.Column(
        db.Integer,
        db.ForeignKey("work_log_message.id"),
        nullable=True
    )

    # Reply childs
    parent = db.relationship(
        "WorkLogMessage",
        remote_side=[id],
        backref=db.backref(
            "children",
            cascade="all, delete-orphan",
            lazy="selectin"
        )
    )
    
    def to_dict(self, depth=0, max_depth=3):
        data = {
            "id": self.id,
            "author": self.author.name,
            "authorInitials": self.author.initials,
            "timestamp": self.created_at.isoformat(),
            "created_at": self.created_at.isoformat(),
            "text": self.text,
            "message": self.text,
            "parentId": self.parent_id,
            "replies": []
        }

        if depth < max_depth:
            data["replies"] = [
                child.to_dict(depth=depth + 1, max_depth=max_depth)
                for child in self.children
                if child.parent_id is not None
            ]
        else:
            data["hasMoreReplies"] = bool(self.children)

        return data