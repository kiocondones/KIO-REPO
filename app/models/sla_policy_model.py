from app import db

from enum import Enum
from datetime import datetime, timezone, timedelta

class TimeUnit(Enum):
    HOURS = "hours"
    MINUTES = "minutes"
    
def _to_timedelta(value: int, unit: TimeUnit) -> timedelta:
    if unit == TimeUnit.HOURS:
        return timedelta(hours=value)
    if unit == TimeUnit.MINUTES:
        return timedelta(minutes=value)
    raise ValueError("Invalid TimeUnit")

class SLAPolicy(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(
        db.Integer,
        db.ForeignKey("account.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        default=1,
    )
    name = db.Column(db.String(100), nullable=False)
    
    response_time = db.Column(db.Integer, nullable=False)
    response_unit = db.Column(db.Enum(TimeUnit), default=TimeUnit.HOURS, nullable=False)
    
    resolution_time = db.Column(db.Integer, nullable=False)
    resolution_unit = db.Column(db.Enum(TimeUnit), default=TimeUnit.HOURS, nullable=False)
    
    escalation_l1 = db.Column(db.Integer, nullable=False)
    escalation_l1_unit = db.Column(db.Enum(TimeUnit), default=TimeUnit.HOURS, nullable=False)
    
    escalation_l2 = db.Column(db.Integer, nullable=False)
    escalation_l2_unit = db.Column(db.Enum(TimeUnit), default=TimeUnit.HOURS, nullable=False)
    
    tickets = db.relationship(
        "Ticket",
        back_populates="priority"
    )
    
    templates = db.relationship(
        "TicketTemplate",
        back_populates="priority"
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

    account = db.relationship("Account")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
        }
        
    def l1_timedelta(self):
        return _to_timedelta(self.escalation_l1, self.escalation_l1_unit)

    def l2_timedelta(self):
        return _to_timedelta(self.escalation_l2, self.escalation_l2_unit)
    
    def resolution_timedelta(self):
        return _to_timedelta(self.resolution_time, self.resolution_unit)

    __table_args__ = (
        db.UniqueConstraint("account_id", "name", name="uq_sla_policy_account_name"),
    )
        
