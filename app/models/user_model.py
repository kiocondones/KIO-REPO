from app import db
from datetime import datetime, timezone
from enum import Enum

class TicketStatus(Enum):
    PENDING = "pending"
    OPEN = "open"
    INVESTIGATING = "investigating"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CLOSED = "closed"
    REJECTED = "rejected"
    

class User(db.Model):
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(
        db.Integer,
        db.ForeignKey("account.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        default=1,
    )
    name = db.Column(db.String(150), nullable=False)
    location = db.Column(db.String(150), default="goli-branch")
    email = db.Column(db.String(150), nullable=False, index=True)
    phone = db.Column(db.String(11), nullable=False, index=True)
    password = db.Column(db.Text, nullable=False)
    is_on_duty = db.Column(db.Boolean, nullable=False, default=False)
    status = db.Column(db.Enum("active", "inactive", name="user_status_enum"), default="active", nullable=False)
    is_password_changed = db.Column(db.Boolean, nullable=False, default=False)
    
    role_id = db.Column(
        db.Integer,
        db.ForeignKey("role.id"),
        nullable=True
    )
    
    role = db.relationship(
        "Role",
        back_populates="users",
    )
    
    department_id = db.Column(
        db.Integer,
        db.ForeignKey("department.department_id", ondelete="RESTRICT"),
        nullable=True
    )
    
    department = db.relationship(
        "Department",
        back_populates="users",
    )

    account = db.relationship(
        "Account",
        back_populates="users",
    )
    
    sent_messages = db.relationship(
        "Message",
        foreign_keys="Message.sender_id",
        back_populates="sender",
        cascade="all, delete-orphan"
    )

    received_messages = db.relationship(
        "Message",
        foreign_keys="Message.recipient_id",
        back_populates="recipient",
        cascade="all, delete-orphan"
    )

    requested_tickets = db.relationship(
        "Ticket",
        foreign_keys="Ticket.requester_id",
        back_populates="requester"
    )

    assigned_tickets = db.relationship(
        "Ticket",
        foreign_keys="Ticket.assigned_to_id",
        back_populates="assigned_to"
    )
    
    tickets_assigned = db.relationship(
        "Ticket",
        foreign_keys="Ticket.assigned_by_id",
        back_populates="assigned_by"
    )
    
    feedbacks = db.relationship(
        "Feedback",
        foreign_keys="Feedback.user_id",
        cascade="all, delete-orphan"
    )
    
    reminders = db.relationship(
        "Reminder",
        back_populates="target_user"
    )
    
    notifications = db.relationship(
        "Notification",
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

    def to_dict(self):
        open_tickets = len([
            t for t in self.assigned_tickets
            if t.status.value == "in_progress"
        ])
        
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "location": self.location,
            "department": self.department.name if self.department else "",
            "department_id": self.department_id if self.department_id else "",
            "assignedTickets": open_tickets,
            "role": self.role.name if self.role else "",
            "status": self.status,
            "lastLogin": "",
            "isOnDuty": self.is_on_duty,
            "account_id": self.account_id
        }
        
    def update_user(self, name, email, phone, department, role, status):
        self.name = name
        self.email = email
        self.phone = phone
        self.department = department
        self.role = role
        self.status = status
        
    def user_name_phone(self):
        return {
            "id": self.id,
            "name": self.name,
            "phone": self.phone
        }
        
    @property
    def initials(self):
        parts = self.name.split()
        return "".join([p[0].upper() for p in parts if p])

    __table_args__ = (
        db.UniqueConstraint("account_id", "email", name="uq_user_account_email"),
        db.UniqueConstraint("account_id", "phone", name="uq_user_account_phone"),
    )
    
class OtpRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(
        db.Integer,
        db.ForeignKey("account.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )
    phone = db.Column(db.String(11), nullable=False, index=True)
    otp = db.Column(db.String(6), nullable=False)
    
    otp_expires_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False
    )
    
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    used_at = db.Column(
        db.DateTime(timezone=True),
        nullable=True
    )