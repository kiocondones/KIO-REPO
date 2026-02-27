from enum import Enum
from datetime import datetime, timezone
from sqlalchemy import Enum as SQLEnum
from app import db

class TicketType(Enum):
    INCIDENT = "INCIDENT"
    SERVICE = "SERVICE"

class TicketTemplateStatus(Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

class TicketTemplate(db.Model):
    id = db.Column(db.String(100), primary_key=True) # Service Code
    account_id = db.Column(
        db.Integer,
        db.ForeignKey("account.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        default=1,
    )

    ticket_type = db.Column(
        SQLEnum(
            TicketType,
            name="tickettype",
            native_enum=True
        ),
        nullable=False
    )
    
    service = db.Column(db.String(100), nullable=False, index=True)
    description = db.Column(db.Text, nullable=False)
    estimated_hours = db.Column(db.Integer, nullable=True)
    template_type = db.Column(
        SQLEnum("JOR", "NONJOR", name="templatetype"),
        nullable=False
    )
    code = db.Column(db.String(150), nullable=False)

    category_id = db.Column(
        db.Integer,
        db.ForeignKey("service_category.id"),
        nullable=False
    )
    category = db.relationship(
        "ServiceCategory",
        back_populates="templates"
    )

    base_rate = db.Column(db.Float, nullable=True)
    min_days = db.Column(db.Integer, nullable=False)
    max_days = db.Column(db.Integer, nullable=False)
    
    priority_id = db.Column(db.Integer, db.ForeignKey('sla_policy.id'), nullable=False)
    priority = db.relationship("SLAPolicy", back_populates="templates")
    
    status = db.Column(
        SQLEnum(
            TicketTemplateStatus,
            name="tickettemplatestatus",
            native_enum=True
        ),
        nullable=False,
        default=TicketTemplateStatus.ACTIVE
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
    
    tickets = db.relationship(
        "Ticket",
        foreign_keys="Ticket.template_id",
        back_populates="template"
    )

    account = db.relationship("Account")

    __table_args__ = (
        db.CheckConstraint("base_rate >= 0", name="check_base_rate_positive"),
        db.CheckConstraint("min_days >= 0", name="check_min_days_positive"),
        db.CheckConstraint("max_days >= min_days", name="check_days_range"),
        db.UniqueConstraint(
            "account_id",
            "ticket_type",
            "service",
            name="uq_ticket_template_account_type_service"
        ),
        db.UniqueConstraint("account_id", "code", name="uq_ticket_template_account_code"),
        db.CheckConstraint(
            "(template_type = 'NONJOR' AND (base_rate IS NULL OR base_rate = 0)) OR template_type = 'JOR'",
            name="check_template_type_base_rate"
        )
    )

    def to_dict(self):
        return {
            "id": self.id,
            "type": self.ticket_type.value,
            "name": self.service,
            "description": self.description,
            "estimated_hours": self.estimated_hours,
            "category": self.category.name if self.category else None,
            "category_id": self.category.id if self.category else None,
            "jorType": self.template_type if self.template_type else None,
            "serviceCode": self.code if self.code else None,
            "baseRate": self.base_rate,
            "sla": str(self.min_days) + " - " + str(self.max_days),
            "status": self.status.value,
            "priority": self.priority_id
        }
