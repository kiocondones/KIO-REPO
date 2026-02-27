from app import db
from datetime import datetime, timezone
from enum import Enum
from sqlalchemy import Enum as SQLEnum


class AccountRequestStatus(Enum):
    """Status enum for account requests"""
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    COMPLETED = "Completed"


class AccountRequest(db.Model):
    """
    Model for user account requests.
    Used when technicians or admins request creation of new user accounts.
    
    From Technician Database merge - enables user onboarding workflow.
    """
    __tablename__ = 'account_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(
        db.Integer,
        db.ForeignKey("account.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        default=1,
    )
    
    # Requestee information
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    contact_number = db.Column(db.String(30), nullable=False)
    id_number = db.Column(db.String(50), nullable=False)
    
    # Account details for new user
    role_id = db.Column(
        db.Integer,
        db.ForeignKey('role.id', ondelete='RESTRICT'),
        nullable=False
    )
    department_id = db.Column(
        db.Integer,
        db.ForeignKey('department.department_id', ondelete='RESTRICT'),
        nullable=False
    )
    
    # Request status
    status = db.Column(
        db.String(20),
        default=AccountRequestStatus.PENDING.value,
        nullable=True,
        comment="Pending, Approved, Rejected, Completed"
    )
    
    # Who requested this account?
    requested_by_id = db.Column(
        db.Integer,
        db.ForeignKey('user.id', ondelete='SET NULL'),
        nullable=True,
        comment="Admin or Technician who created request"
    )
    
    requested_by = db.relationship(
        "User",
        foreign_keys=[requested_by_id],
        backref="account_requests_created"
    )

    role = db.relationship("Role")
    department = db.relationship("Department")
    
    # Timestamps
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=True
    )
    
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=True
    )
    
    def to_dict(self):
        """Convert to dictionary representation"""
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "contactNumber": self.contact_number,
            "idNumber": self.id_number,
            "role": self.role.name if self.role else None,
            "roleId": self.role_id,
            "department": self.department.name if self.department else None,
            "departmentId": self.department_id,
            "status": self.status,
            "requestedBy": self.requested_by.name if self.requested_by else None,
            "requestedById": self.requested_by_id,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
    
    def approve(self):
        """Approve this account request"""
        self.status = AccountRequestStatus.APPROVED.value
        self.updated_at = datetime.now(timezone.utc)
    
    def reject(self):
        """Reject this account request"""
        self.status = AccountRequestStatus.REJECTED.value
        self.updated_at = datetime.now(timezone.utc)
    
    def complete(self):
        """Mark as completed (user created)"""
        self.status = AccountRequestStatus.COMPLETED.value
        self.updated_at = datetime.now(timezone.utc)
    
    def __repr__(self):
        return f"<AccountRequest {self.id}: {self.email} ({self.status})>"
