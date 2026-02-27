from app import db
from datetime import datetime, timezone

class ServiceCategory(db.Model):
    """
    Service Category model to decouple from department table
    Uses SC001 format IDs for better identification
    """
    __tablename__ = 'service_category'
    
    id = db.Column(db.Integer, primary_key=True)  # SC001, SC002, etc.
    account_id = db.Column(
        db.Integer,
        db.ForeignKey("account.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        default=1,
    )
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(10), nullable=True)
    
    department_id = db.Column(
        db.Integer,
        db.ForeignKey("department.department_id", ondelete="RESTRICT"),
        nullable=True
    )
    
    department = db.relationship(
        "Department",
        back_populates="categories",
        foreign_keys=[department_id]
    )
    
    templates = db.relationship(
        "TicketTemplate",
        back_populates="category",
        foreign_keys="TicketTemplate.category_id",
        cascade="all, delete-orphan"
    )
    
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    account = db.relationship("Account")
    
    def to_dict(self):
        """Convert service category to dictionary for JSON responses"""
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'total_templates': len(self.templates) or 0
        }
    
    def __repr__(self):
        return f'<ServiceCategory {self.id}: {self.name}>'

    __table_args__ = (
        db.UniqueConstraint("account_id", "name", name="uq_service_category_account_name"),
        db.UniqueConstraint("account_id", "code", name="uq_service_category_account_code"),
    )