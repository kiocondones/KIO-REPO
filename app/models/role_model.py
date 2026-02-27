from app import db

class Role(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(
        db.Integer,
        db.ForeignKey("account.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        default=1,
    )
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    
    department_id = db.Column(
        db.Integer,
        db.ForeignKey("department.department_id"),
        nullable=True
    )
    
    department = db.relationship(
        "Department",
        back_populates="roles",
    )
    
    users = db.relationship(
        "User",
        back_populates="role",
    )

    account = db.relationship("Account")

    __table_args__ = (
        db.UniqueConstraint("account_id", "name", name="uq_role_account_name"),
    )