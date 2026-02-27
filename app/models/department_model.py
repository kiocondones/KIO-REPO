from app import db
from datetime import datetime, timezone

class Department(db.Model):
    __tablename__ = 'department'
    
    id = db.Column('department_id', db.Integer, primary_key=True)
    account_id = db.Column(
        db.Integer,
        db.ForeignKey("account.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        default=1,
    )
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    
    categories = db.relationship(
        "ServiceCategory",
        back_populates="department",
    )
    
    users = db.relationship(
        "User",
        back_populates="department"
    )
    
    reminders = db.relationship(
        "Reminder",
        back_populates="target_department"
    )
    
    roles = db.relationship(
        "Role",
        back_populates="department",
    )

    account = db.relationship("Account")
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
        }

    __table_args__ = (
        db.UniqueConstraint("account_id", "name", name="uq_department_account_name"),
    )