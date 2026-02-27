from sqlalchemy import func
from datetime import datetime, timezone
import re

from app import db
from app.models import Ticket, TicketTemplate
from app.models import User, TicketStatus

def generate_id(template=False, account_id=None):
    model = TicketTemplate if template else Ticket
    prefix = "TPL" if template else "JOR"

    query = db.session.query(model.id).filter(model.id.like(f"{prefix}%"))
    if account_id is not None and hasattr(model, "account_id"):
        query = query.filter(model.account_id == account_id)

    last_id = (
        query.order_by(func.length(model.id).desc(), model.id.desc())
        .limit(1)
        .scalar()
    )

    if not last_id:
        return f"{prefix}001"

    match = re.search(rf"{prefix}(\d+)", last_id)
    if not match:
        raise ValueError(f"Invalid ID format: {last_id}")

    next_number = int(match.group(1)) + 1
    return f"{prefix}{next_number:03d}"

def get_technicians_with_open_tasks():
    return (
        db.session.query(
            User,
            func.count(Ticket.id).label("open_tasks")
        )
        .outerjoin(
            Ticket,
            (Ticket.assigned_to_id == User.id) &
            (Ticket.status == TicketStatus.IN_PROGRESS) 
        )
        .filter(User.role.name == "technician")
        .group_by(User.id)
        .all()
    )
    
def technician_assign_view(user, open_tasks):
    return {
        "id": user.id,
        "name": user.name,
        "role": user.role.name if user.role else None,
        "department": user.department.name if user.department else None,
        "openTasks": open_tasks,
        "taskLabel": "open tickets",
        "status": "online", 
    }

def utcnow() -> datetime:
    return datetime.now(timezone.utc)

def as_utc(dt: datetime | None) -> datetime | None:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)