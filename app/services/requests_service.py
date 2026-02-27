from flask import g
from flask_restful import Resource
from sqlalchemy.orm import joinedload
from datetime import datetime, timezone
from flask_jwt_extended import jwt_required
from sqlalchemy import func

from app import db
from app.models import Ticket, Task, WorkLog, WorkLog, TicketStatus, Department, Role
from app.utils import get_technicians_with_open_tasks, technician_assign_view
from app.utils import load_user, is_password_changed, is_account_active

class ServiceManagementRequests(Resource):
    method_decorators = [
        is_account_active,
        # is_password_changed,
        load_user,
        jwt_required(),
    ]
    
    def get(self, ticket_id=None):
        user = getattr(g, "user", None)
        account_id = user.account_id if user else None

        if ticket_id:
            query = Ticket.query.options(
                joinedload(Ticket.requester),
                joinedload(Ticket.assigned_to),
                joinedload(Ticket.tasks).joinedload(Task.assigned_to),
                joinedload(Ticket.work_logs).joinedload(WorkLog.author),
                joinedload(Ticket.history),
                joinedload(Ticket.resolution),
                joinedload(Ticket.check_list)
            )
            
            ticket = query.filter_by(id=ticket_id, account_id=account_id).first()
            if not ticket:
                return { "message": "Ticket not found", "success": False}, 404

            return {
                "success": True,
                "details": ticket.to_request_details(),
                "tasks": [t.to_dict() for t in ticket.tasks],
                "workLogs": [wl.to_dict() for wl in ticket.work_logs],
                "history": [h.to_dict() for h in ticket.history],
                "resolution": [r.to_dict() for r in ticket.resolution],
                "checklists": [c.to_dict() for c in ticket.check_list],
                **ticket.to_service_management_request(),
                
            }, 200
            
        OPEN_STATUSES = [
            TicketStatus.NEW,
            TicketStatus.OPEN,
            TicketStatus.ASSIGNED,
            TicketStatus.IN_PROGRESS,
        ]

        now = datetime.now(timezone.utc)
        today = now.date()
        
        total_requests = db.session.query(func.count(Ticket.id)).filter(
            Ticket.account_id == account_id
        ).scalar()
        
        open_problems = db.session.query(
            func.count(Ticket.id)
        ).filter(
            Ticket.status.in_(OPEN_STATUSES),
            Ticket.account_id == account_id
        ).scalar()

        open_problems = db.session.query(func.count(Ticket.id)).filter(
            Ticket.status.in_([TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.ASSIGNED]),
            Ticket.account_id == account_id
        ).scalar()

        pending_changes = db.session.query(func.count(Ticket.id)).filter(
            Ticket.status == TicketStatus.NEW,
            Ticket.account_id == account_id
        ).scalar()
        
        assigned_tickets = db.session.query(func.count(Ticket.id)).filter(
            Ticket.assigned_to_id.isnot(None),
            Ticket.account_id == account_id
        ).scalar()

        resolved_today = db.session.query(func.count(Ticket.id)).filter(
            Ticket.status == TicketStatus.COMPLETED,
            func.date(Ticket.resolved_at) == today,
            Ticket.account_id == account_id
        ).scalar()
        
        opened_tickets = Ticket.query.filter(
            Ticket.status.in_(OPEN_STATUSES),
            Ticket.account_id == account_id
        ).all()
        
        due_today = 0
        overdue = 0
        
        # for ticket in opened_tickets:
        #     if not ticket.deadline:
        #         continue

        #     deadline_date = ticket.deadline.date()

        #     if deadline_date == today:
        #         due_today += 1
        #     elif deadline_date < today:
        #         overdue += 1
        
        departments = Department.query.filter_by(account_id=account_id).all()
        technicians = Role.query.filter_by(name="technician", account_id=account_id).first()
                
        return {
            "success": True,
            "metrics": {
                "totalRequests": total_requests,
                "openProblems": open_problems,
                "pendingChanges": pending_changes,
                "resolvedToday": resolved_today,
                "dueToday": due_today,
                "overdue": overdue,
            },
            "stats": {
                "assigned": assigned_tickets,
                "dueToday": 0,
                "overDue": 0
                },
            "tickets": [t.to_service_management_request() for t in opened_tickets],
            "departments": [d.to_dict() for d in departments],
            "technicians": [u.to_dict() for u in technicians.users] if technicians else []
        }, 200
        
# class OpenProblemsService(Resource):
#     def get(self):
        