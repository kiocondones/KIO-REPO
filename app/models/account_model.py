from datetime import datetime, timezone
from sqlalchemy import String, Text, Integer, Boolean
from app import db


class Account(db.Model):
    """Account model for multi-tenant support"""
    
    __tablename__ = 'account'
    
    id = db.Column(Integer, primary_key=True)
    name = db.Column(String(255), nullable=False, unique=True, 
                     comment="Unique account name")
    description = db.Column(Text, nullable=True,
                           comment="Account description")
    is_active = db.Column(Boolean, default=True, nullable=False,
                         comment="Account active status")
    created_at = db.Column(db.DateTime(timezone=True), 
                          default=lambda: datetime.now(timezone.utc),
                          comment="Account creation timestamp")
    updated_at = db.Column(db.DateTime(timezone=True), 
                          default=lambda: datetime.now(timezone.utc),
                          onupdate=lambda: datetime.now(timezone.utc),
                          comment="Last account update timestamp")
    
    # Relationships
    users = db.relationship(
        "User",
        back_populates="account",
        cascade="all, delete-orphan",
    )
    
    def __repr__(self):
        return f'<Account {self.id}: {self.name}>'
    
    def to_dict(self):
        """Convert account to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def activate(self):
        """Activate the account"""
        self.is_active = True
        self.updated_at = datetime.now(timezone.utc)
        
    def deactivate(self):
        """Deactivate the account"""
        self.is_active = False
        self.updated_at = datetime.now(timezone.utc)
