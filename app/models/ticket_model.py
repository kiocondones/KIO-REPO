from app import db
from datetime import datetime, timezone
from enum import Enum
from sqlalchemy import Enum as SQLEnum

class TicketStatus(Enum):
    NEW = "NEW"
    OPEN = "OPEN"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    ON_HOLD = "ON_HOLD"
    COMPLETED = "COMPLETED"
    CLOSED = "CLOSED"
    REJECTED = "REJECTED"
    
class TicketType(Enum):
    INCIDENT="INCIDENT"
    SERVICE="SERVICE"

class Ticket(db.Model):
    id = db.Column(db.String(10), primary_key=True)
    account_id = db.Column(
        db.Integer,
        db.ForeignKey("account.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        default=1,
    )
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    channel = db.Column(db.String(100), default="Web Form")
    location = db.Column(db.String(100))
    ticket_type = db.Column(SQLEnum(TicketType, name="ticket_type"), nullable=False)
    issue_type = db.Column(db.String(100), nullable=True, comment="Issue type selected by requestor (e.g., Network Issue, Equipment)")
    resolved_at = db.Column(db.DateTime(timezone=True), nullable=True)
    priority_id = db.Column(db.Integer, db.ForeignKey('sla_policy.id'), nullable=False)
    priority = db.relationship("SLAPolicy", back_populates="tickets")

    status = db.Column(
        SQLEnum(TicketStatus, name="ticket_status"),
        nullable=False,
        default=TicketStatus.OPEN
    )

    is_assigned = db.Column(db.Boolean, nullable=False, default=False)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    
    requester_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, index=True)
    assigned_to_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True, index=True)
    assigned_by_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True, index=True)
    
    requester = db.relationship(
        "User",
        foreign_keys=[requester_id],
        back_populates="requested_tickets"
    )

    assigned_to = db.relationship(
        "User",
        foreign_keys=[assigned_to_id],
        back_populates="assigned_tickets"
    )
    
    assigned_by = db.relationship(
        "User",
        foreign_keys=[assigned_by_id],
        back_populates="tickets_assigned"
    )
    
    template_id = db.Column(
        db.String(100),
        db.ForeignKey("ticket_template.id"),
        nullable=True
    )

    template = db.relationship(
        "TicketTemplate",
        foreign_keys=[template_id],
        back_populates="tickets"
    )

    # Service Configuration Fields
    service_provider_id = db.Column(
        db.Integer,
        db.ForeignKey("department.department_id"),
        nullable=True,
        comment="Service Provider (Department)"
    )
    
    service_category_id = db.Column(
        db.Integer,
        db.ForeignKey("service_category.id"),
        nullable=True,
        comment="Service Category"
    )
    
    severity_adjustment = db.Column(
        db.String(50),
        nullable=True,
        default="normal",
        comment="Severity adjustment level (normal, high, critical)"
    )
    
    severity_multiplier = db.Column(
        db.Float,
        nullable=True,
        default=1.0,
        comment="Severity multiplier for service fee calculation"
    )

    service_provider = db.relationship(
        "Department",
        foreign_keys=[service_provider_id],
        backref="service_tickets"
    )
    
    service_category = db.relationship(
        "ServiceCategory",
        foreign_keys=[service_category_id],
        backref="service_tickets"
    )

    # SLA tracking fields (from Technician database merge)
    sla_started_at = db.Column(
        db.DateTime(timezone=True),
        nullable=True,
        comment="When SLA tracking started"
    )
    
    sla_minutes = db.Column(
        db.Integer,
        nullable=True,
        comment="SLA minutes remaining"
    )
    
    approved_at = db.Column(
        db.DateTime(timezone=True),
        nullable=True,
        comment="When ticket was approved"
    )

    service_fee = db.Column(
        db.Numeric(10, 2),
        nullable=False,
        default=0.00,
        comment="Service fee calculated from ticket type and severity"
    )

    history = db.relationship(
        "History",
        back_populates="ticket",
        order_by="History.created_at.asc()",
        cascade="all, delete-orphan"
    )
    
    tasks = db.relationship(
        "Task",
        back_populates="ticket",
        cascade="all, delete-orphan"
    )
    
    work_logs = db.relationship(
        "WorkLog",
        back_populates="ticket",
        cascade="all, delete-orphan"
    )
    
    check_list = db.relationship(
        "CheckList",
        back_populates="ticket",
        cascade="all, delete-orphan"
    )
    
    resolution = db.relationship(
        "Resolution",
        back_populates="ticket",
        cascade="all, delete-orphan"
    )
    
    feedback = db.relationship(
        "Feedback",
        back_populates="ticket",
        uselist=False,
        cascade="all, delete-orphan"
    )
    
    reminders = db.relationship(
        "Reminder",
        back_populates="target_ticket",
    )
    
    files = db.relationship(
        "File",
        back_populates="ticket"
    )

    account = db.relationship("Account")
    
    def to_dict(self):
        # Get service code from template
        service_code = None
        if self.template:
            service_code = self.template.code
        
        # Get SLA info from template (min and max days)
        sla_info = None
        if self.template:
            sla_info = f"{self.template.min_days} - {self.template.max_days} days"
        
        # Get service provider/category name
        service_provider_name = "General Support"
        if self.service_category:
            service_provider_name = self.service_category.name
        elif self.template and self.template.category:
            service_provider_name = self.template.category.name
        
        # Get rating if feedback exists
        rating = None
        if self.feedback:
            rating = self.feedback.rating
        
        return {
            "id": self.id,
            "number": self.id,
            "title": self.title,
            "description": self.description,
            "priority": self.priority.name if self.priority else "Standard",
            "location": self.location,
            "status": self.status.value,
            "requesterName": self.requester.name,
            "requester": self.requester.name,
            "assignedTo": self.assigned_to.name if self.assigned_to else None,
            "assignedBy": self.assigned_by.name if self.assigned_by else None,
            "issueType": self.issue_type if self.issue_type else "General",
            "serviceProvider": service_provider_name,
            "serviceCode": service_code,
            "sla": sla_info,
            "attachments": [f.to_dict() for f in self.files],
            "createdAt": self.created_at.isoformat(),
            "time": self.created_at.isoformat(),
            "cost": float(self.service_fee) if self.service_fee else 0,
            "rating": rating,
        }
        
    def to_service_management_request(self):
        return {
            "id": self.id,
            "subject": self.title,
            "requester": self.requester.name,
            "assignedTo": self.assigned_to.name if self.assigned_to else None,
            "assignedBy": self.assigned_by.name if self.assigned_by else None,
            "assignedById": self.assigned_by.id if self.assigned_by else None,
            "status": self.status.value,
            "priority": self.priority.name,
            "category": self.template.category.name if self.template and self.template.category else None,
            "createdAt": self.created_at.isoformat(),
        }
        
    def to_request_details(self):
        return {
            "id": self.id,
            "service": self.title,
            "description": self.description,
            "technician": self.assigned_to.name if self.assigned_to else None,
            "status": "Assigned" if self.assigned_to else None,
            "priority": self.priority.name,
            "requestType": self.ticket_type.value,
            "priority": self.priority.name,
            "createdDate": self.created_at.isoformat(),
        }
        
    def get_pendings(self):
        return {
            "id": self.id,
            "requester": self.requester.name,
            "priority": self.priority.name,
            "createdAt": self.created_at.isoformat(),
        }
        
    def escalation_level(self):
        now = datetime.now(timezone.utc)
        created_at = self.created_at

        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)

        elapsed = now - created_at

        l1 = self.priority.l1_timedelta()
        l2 = self.priority.l2_timedelta()

        if elapsed >= l2:
            return "L2"
        if elapsed >= l1:
            return "L1"
        return None

    
    def ticketPreview(self):
        return{
            "id": self.id,
            "title": self.title,
            "location": self.location,
            "description": self.description,
            "createdAt": self.created_at.isoformat(),
            "priority": self.priority.name
        }