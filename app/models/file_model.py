from app import db
from datetime import datetime, timezone
from sqlalchemy import CheckConstraint
from flask import url_for

class File(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(
        db.Integer,
        db.ForeignKey("account.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        default=1,
    )

    # File metadata
    filename = db.Column(db.String(255), nullable=False)
    size = db.Column(db.Integer, nullable=False)
    mimetype = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(500), nullable=False)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    
    ticket_id = db.Column(db.String(100), db.ForeignKey("ticket.id"), nullable=True)
    ticket = db.relationship( "Ticket", back_populates="files")

    __table_args__ = (
        CheckConstraint("size >= 0", name="check_file_size_non_negative"),
        CheckConstraint("size <= 10485760", name="check_file_size_less_10mb"),  # 10 MB
    )

    def to_dict(self):
        return url_for("uploaded_file", filename=self.location, _external=True)