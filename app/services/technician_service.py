from flask import request, g
from flask_restful import Resource
from flask_jwt_extended import jwt_required
from datetime import datetime

from app.utils import load_user, is_password_changed, is_account_active
from app.models import Ticket, User, TicketStatus, History, Task, CheckList, WorkLog
from app import db
def _status_label(status: TicketStatus | None) -> str:
    if not status:
        return "New"
    label = status.value.replace("_", " ")
    return " ".join([w.capitalize() for w in label.split()])


class TechnicianDashboardService(Resource):
    """Technician dashboard stats"""
    method_decorators = [
        is_account_active,
        load_user,
        jwt_required(),
    ]

    def get(self):
        user = g.user
        
        # Only technicians can access
        if user.role.name.lower() != "technician":
            return {"message": "Unauthorized"}, 403
        
        assigned_tickets = Ticket.query.filter_by(
            assigned_to_id=user.id,
            account_id=user.account_id
        ).all()
        
        stats = {
            'assigned': len(assigned_tickets),
            'in_progress': len([t for t in assigned_tickets if t.status == TicketStatus.IN_PROGRESS]),
            'resolved': len([t for t in assigned_tickets if t.status == TicketStatus.COMPLETED]),
            'open': len([t for t in assigned_tickets if t.status == TicketStatus.OPEN]),
        }
        
        return stats, 200


class TechnicianTicketService(Resource):
    """Get assigned tickets and update their status/details"""
    method_decorators = [
        is_account_active,
        load_user,
        jwt_required(),
    ]

    def get(self, ticket_id=None):
        user = g.user
        
        # Only technicians can access
        if user.role.name.lower() != "technician":
            return {"message": "Unauthorized"}, 403
        
        if ticket_id:
            ticket = Ticket.query.filter_by(
                id=ticket_id,
                assigned_to_id=user.id,
                account_id=user.account_id
            ).first()
            
            if not ticket:
                return {"message": "Ticket not found"}, 404
            
            data = {
                **ticket.to_dict(),
                "tasks": [t.to_dict() for t in ticket.tasks],
                "checklist": [c.to_dict() for c in ticket.check_list],
                "worklogs": [w.to_dict() for w in ticket.work_logs],
                "history": [h.to_dict() for h in ticket.history],
                "resolution": [r.to_dict() for r in ticket.resolution],
            }
            data["status"] = _status_label(ticket.status)
            data["statusRaw"] = ticket.status.value
            return data, 200
        
        # Get all assigned tickets with optional status filter
        status = request.args.get('status')
        query = Ticket.query.filter_by(
            assigned_to_id=user.id,
            account_id=user.account_id
        )
        
        if status and status.lower() != "all":
            status_enum = TicketStatus[status.upper().replace(" ", "_")]
            query = query.filter_by(status=status_enum)
        
        tickets = query.order_by(Ticket.updated_at.desc()).all()
        payload = []
        for t in tickets:
            row = t.to_dict()
            row["status"] = _status_label(t.status)
            row["statusRaw"] = t.status.value
            payload.append(row)
        return payload, 200
    
    def put(self, ticket_id=None):
        """Update ticket status and add history/worklog"""
        if not ticket_id:
            return {"message": "Ticket ID required"}, 400
        
        user = g.user
        if user.role.name.lower() != "technician":
            return {"message": "Unauthorized"}, 403
        
        ticket = Ticket.query.filter_by(
            id=ticket_id,
            assigned_to_id=user.id,
            account_id=user.account_id
        ).first()
        
        if not ticket:
            return {"message": "Ticket not found"}, 404
        
        data = request.get_json()
        action = data.get('action', '').lower()
        notes = data.get('notes', '')
        
        # Status transitions
        if action == 'accept':
            ticket.status = TicketStatus.IN_PROGRESS
            history_action = "Work Started"
            history_msg = "Technician accepted ticket and started work."
        
        elif action == 'resolve':
            if ticket.status in (TicketStatus.COMPLETED, TicketStatus.CLOSED, TicketStatus.REJECTED):
                return {"message": "Cannot resolve a closed ticket"}, 400
            
            ticket.status = TicketStatus.COMPLETED
            history_action = "Resolved"
            history_msg = notes or "Ticket resolved by technician."
        
        elif action == 'pause':
            if ticket.status != TicketStatus.IN_PROGRESS:
                return {"message": "Can only pause in-progress tickets"}, 400
            
            ticket.status = TicketStatus.ON_HOLD
            history_action = "Paused"
            history_msg = notes or "Work paused."
        
        elif action == 'close':
            ticket.status = TicketStatus.CLOSED
            history_action = "Closed"
            history_msg = notes or "Ticket closed."
        
        else:
            return {"message": "Invalid action"}, 400
        
        ticket.updated_at = datetime.utcnow()
        if action in ("resolve", "close"):
            ticket.resolved_at = datetime.utcnow()
        
        # Add history entry
        history = History(
            account_id=user.account_id,
            ticket_id=ticket.id,
            user_id=user.id,
            action=history_action,
            details=history_msg
        )
        
        db.session.add(history)
        db.session.commit()
        
        return {
            "message": f"Ticket {action}ed successfully",
            "success": True,
            "ticket": ticket.to_dict()
        }, 200


class TechnicianWorklogService(Resource):
    """Add and view worklogs/notes for tickets"""
    method_decorators = [
        is_account_active,
        load_user,
        jwt_required(),
    ]

    def post(self, ticket_id=None):
        """Add a worklog/note to a ticket"""
        if not ticket_id:
            return {"message": "Ticket ID required"}, 400
        
        user = g.user
        
        ticket = Ticket.query.filter_by(
            id=ticket_id,
            assigned_to_id=user.id,
            account_id=user.account_id
        ).first()
        
        if not ticket:
            return {"message": "Ticket not found"}, 404
        
        data = request.get_json()
        message = data.get('message', '').strip()
        
        if not message:
            return {"message": "Message is required"}, 400
        
        # Add as history entry
        worklog = WorkLog(
            account_id=user.account_id,
            title="Worklog",
            description=message,
            ticket=ticket,
            author=user
        )

        history = History(
            account_id=user.account_id,
            ticket_id=ticket.id,
            user_id=user.id,
            action="Worklog added",
            details=message
        )
        
        db.session.add(worklog)
        db.session.add(history)
        db.session.commit()
        
        return {
            "message": "Note added successfully",
            "success": True,
            "worklog": worklog.to_dict()
        }, 201


class TechnicianTaskService(Resource):
    """Update tasks for assigned tickets"""
    method_decorators = [
        is_account_active,
        load_user,
        jwt_required(),
    ]

    def put(self, ticket_id=None):
        """Update task completion status"""
        if not ticket_id:
            return {"message": "Ticket ID required"}, 400
        
        user = g.user
        
        ticket = Ticket.query.filter_by(
            id=ticket_id,
            assigned_to_id=user.id,
            account_id=user.account_id
        ).first()
        
        if not ticket:
            return {"message": "Ticket not found"}, 404
        
        # Check if ticket is locked
        if ticket.status in (TicketStatus.COMPLETED, TicketStatus.CLOSED, TicketStatus.REJECTED):
            return {"message": "Cannot modify tasks for closed tickets"}, 400
        
        data = request.get_json()
        tasks_payload = data.get('tasks', [])
        
        for task_data in tasks_payload:
            task_id = task_data.get('id')
            is_completed = task_data.get('isCompleted', False)
            
            if task_id is None:
                continue
            
            task = Task.query.filter_by(
                id=task_id,
                ticket_id=ticket_id,
                account_id=user.account_id
            ).first()
            if not task:
                continue
            
            old_status = task.is_completed
            task.is_completed = is_completed
            
            # Add history for task completion
            if not old_status and is_completed:
                history = History(
                    account_id=user.account_id,
                    ticket_id=ticket_id,
                    user_id=user.id,
                    action="Task Accomplished",
                    details=f"Task completed: {task.title}"
                )
                db.session.add(history)
        
        db.session.commit()
        
        return {
            "message": "Tasks updated successfully",
            "success": True
        }, 200


class TechnicianChecklistService(Resource):
    """Update checklists for assigned tickets"""
    method_decorators = [
        is_account_active,
        load_user,
        jwt_required(),
    ]

    def put(self, ticket_id=None):
        """Update checklist item completion status"""
        if not ticket_id:
            return {"message": "Ticket ID required"}, 400
        
        user = g.user
        
        ticket = Ticket.query.filter_by(
            id=ticket_id,
            assigned_to_id=user.id,
            account_id=user.account_id
        ).first()
        
        if not ticket:
            return {"message": "Ticket not found"}, 404
        
        # Check if ticket is locked
        if ticket.status in (TicketStatus.COMPLETED, TicketStatus.CLOSED, TicketStatus.REJECTED):
            return {"message": "Cannot modify checklists for closed tickets"}, 400
        
        data = request.get_json()
        checklist_payload = data.get('checklist', [])
        
        for item_data in checklist_payload:
            item_id = item_data.get('id')
            is_completed = item_data.get('isCompleted', False)
            
            if item_id is None:
                continue
            
            item = Checklist.query.filter_by(
                id=item_id,
                ticket_id=ticket_id,
                account_id=user.account_id
            ).first()
            if not item:
                continue
            
            old_status = item.is_completed
            item.is_completed = is_completed
            
            # Add history for checklist completion
            if not old_status and is_completed:
                history = History(
                    account_id=user.account_id,
                    ticket_id=ticket_id,
                    user_id=user.id,
                    action="Checklist Completed",
                    details=f"Checklist item completed: {item.title}"
                )
                db.session.add(history)
        
        db.session.commit()
        
        return {
            "message": "Checklist updated successfully",
            "success": True
        }, 200
