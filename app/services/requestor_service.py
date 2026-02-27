from flask import request, g
from flask_restful import Resource
from flask_jwt_extended import jwt_required
from datetime import datetime, timezone
from werkzeug.utils import secure_filename
import os
from sqlalchemy.orm import joinedload

from app.utils import load_user, is_password_changed, is_account_active, generate_id
from app.models import (
    Ticket,
    User,
    TicketStatus,
    TicketType,
    History,
    Task,
    Checklist,
    Notification,
    File,
    Feedback,
    WorkLog,
    SLAPolicy,
    TicketTemplate,
    ServiceCategory,
    Department,
)
from app import db

def _is_requestor(user):
    return bool(
        user
        and user.role
        and user.role.name and user.role.name.strip().lower() in {"viewer", "requestor", "admin", "manager"}
    )


class RequestorDashboardService(Resource):
    """Requestor dashboard stats"""
    method_decorators = [
        is_account_active,
        load_user,
        jwt_required(),
    ]

    def get(self):
        user = g.user
        
        # Only "Viewer" role (requestors) can access
        if not _is_requestor(user):
            return {"message": "Unauthorized"}, 403
        
        tickets = Ticket.query.filter_by(
            requester_id=user.id,
            account_id=user.account_id
        ).all()
        
        # Calculate expenses from service_fee
        now = datetime.now(timezone.utc)
        current_year = now.year
        current_month = now.month
        
        total_spent = 0.0
        ytd_expenses = 0.0
        mtd_expenses = 0.0
        
        for ticket in tickets:
            if ticket.service_fee:
                fee_amount = float(ticket.service_fee)
                total_spent += fee_amount
                
                # Year-to-date: tickets created in current year
                if ticket.created_at.year == current_year:
                    ytd_expenses += fee_amount
                    
                    # Month-to-date: tickets created in current month
                    if ticket.created_at.month == current_month:
                        mtd_expenses += fee_amount
        
        stats = {
            "total": len(tickets),
            "open": len([t for t in tickets if t.status == TicketStatus.NEW]),
            "in_progress": len([t for t in tickets if t.status in (TicketStatus.IN_PROGRESS, TicketStatus.ASSIGNED)]),
            "resolved": len([t for t in tickets if t.status == TicketStatus.COMPLETED]),
            "closed": len([t for t in tickets if t.status == TicketStatus.CLOSED]),
            "totalSpent": total_spent,
            "ytdExpenses": ytd_expenses,
            "mtdExpenses": mtd_expenses,
        }
        
        return stats, 200


class RequestorTicketListService(Resource):
    """Get requestor's tickets and create new ones"""
    method_decorators = [
        is_account_active,
        load_user,
        jwt_required(),
    ]

    def get(self):
        user = g.user
        
        if not _is_requestor(user):
            return {"message": "Unauthorized"}, 403
        
        status = request.args.get('status')
        query = Ticket.query.filter_by(
            requester_id=user.id,
            account_id=user.account_id
        )
        
        if status and status.lower() != "all":
            try:
                status_enum = TicketStatus[status.upper().replace(" ", "_")]
                query = query.filter_by(status=status_enum)
            except KeyError:
                pass
        
        tickets = query.order_by(Ticket.created_at.desc()).all()
        return [t.to_dict() for t in tickets], 200
    
    def post(self):
        """Create new ticket with optional service configuration"""
        user = g.user
        
        if not _is_requestor(user):
            return {"message": "Unauthorized"}, 403
        
        data = request.get_json() or request.form
        title = data.get('title', '').strip()
        description = data.get('description', '').strip()
        priority = data.get('priority', 'MEDIUM').upper()
        location = data.get('location', user.location)
        issue_type = data.get('issueType', 'General')  # Issue type name (e.g., "Network Issue", "Equipment")
        ticket_type_str = data.get('ticketType', 'incident')  # Ticket type (incident or service)
        service_provider = data.get('serviceProvider', 'General Support')
        
        # Service configuration fields
        service_provider_id = data.get('service_provider_id') or data.get('providerId')
        service_category_id = data.get('service_category_id') or data.get('categoryId')
        template_id = data.get('template_id') or data.get('templateId')
        severity_adjustment = data.get('severity_adjustment', 'normal')
        
        # Calculate service fee based on template and severity
        service_fee = float(data.get('cost', 0) or 0)
        severity_multiplier = 1.0
        
        if not title:
            return {"message": "Title is required", "success": False}, 400
        if not description:
            return {"message": "Description is required", "success": False}, 400
        
        try:
            ticket_id = generate_id(account_id=user.account_id)

            policy = (
                SLAPolicy.query
                .filter_by(account_id=user.account_id)
                .order_by(SLAPolicy.id.asc())
                .first()
            )

            if not policy:
                return {"message": "No SLA policy configured", "success": False}, 400

            try:
                ticket_type = TicketType.SERVICE if str(ticket_type_str).lower().startswith("service") else TicketType.INCIDENT
            except Exception:
                ticket_type = TicketType.INCIDENT

            # Handle severity multiplier
            severity_map = {
                "normal": 1.0,
                "high": 1.25,
                "critical": 1.5
            }
            severity_multiplier = severity_map.get(severity_adjustment.lower(), 1.0)
            
            # If template is provided, fetch and auto-populate
            template = None
            if template_id:
                template = TicketTemplate.query.filter_by(
                    id=template_id,
                    account_id=user.account_id
                ).first()
                
                if template:
                    # Auto-populate service fee from template
                    if template.base_rate:
                        service_fee = float(template.base_rate) * severity_multiplier
                    
                    # Use template category and provider if available
                    if template.category:
                        service_category_id = template.category_id
                        if template.category.department:
                            service_provider_id = template.category.department_id

            ticket = Ticket(
                id=ticket_id,
                account_id=user.account_id,
                title=title,
                description=description,
                location=location,
                priority_id=policy.id,
                requester_id=user.id,
                ticket_type=ticket_type,
                issue_type=issue_type,
                status=TicketStatus.NEW,
                channel="Web Portal",
                service_fee=service_fee,
                template_id=template_id,
                service_provider_id=service_provider_id,
                service_category_id=service_category_id,
                severity_adjustment=severity_adjustment,
                severity_multiplier=severity_multiplier,
            )
            
            # Add initial history
            details = f"Request created via {service_provider}"
            if template:
                details += f" - Service: {template.service}"
            
            history = History(
                account_id=user.account_id,
                ticket_id=ticket_id,
                user_id=user.id,
                action="Ticket created",
                details=details
            )
            
            db.session.add(ticket)
            db.session.add(history)
            db.session.commit()
            
            return {
                "message": "Ticket created successfully",
                "success": True,
                "ticket": ticket.to_dict()
            }, 201
        
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error creating ticket: {str(e)}", "success": False}, 500


class RequestorTicketDetailService(Resource):
    """Get ticket details (only owner can view)"""
    method_decorators = [
        is_account_active,
        load_user,
        jwt_required(),
    ]

    def get(self, ticket_id=None):
        if not ticket_id:
            return {"message": "Ticket ID required"}, 400
        
        user = g.user
        
        if not _is_requestor(user):
            return {"message": "Unauthorized"}, 403
        
        ticket = Ticket.query.options(
            joinedload(Ticket.template).joinedload(TicketTemplate.category),
            joinedload(Ticket.service_category).joinedload(ServiceCategory.templates),
            joinedload(Ticket.service_provider).joinedload(Department.categories).joinedload(ServiceCategory.templates),
        ).filter_by(
            id=ticket_id,
            requester_id=user.id,
            account_id=user.account_id
        ).first()
        
        if not ticket:
            return {"message": "Ticket not found"}, 404
        
        return {
            **ticket.to_dict(),
            "tasks": [t.to_dict() for t in ticket.tasks],
            "checklist": [c.to_dict() for c in ticket.check_list],
            "worklogs": [w.to_dict() for w in ticket.work_logs],
            "history": [h.to_dict() for h in ticket.history],
            "resolution": [r.to_dict() for r in ticket.resolution],
        }, 200


class RequestorTicketRatingService(Resource):
    """Rate completed tickets"""
    method_decorators = [
        is_account_active,
        load_user,
        jwt_required(),
    ]

    def post(self, ticket_id=None):
        if not ticket_id:
            return {"message": "Ticket ID required"}, 400
        
        user = g.user
        
        ticket = Ticket.query.filter_by(
            id=ticket_id,
            requester_id=user.id,
            account_id=user.account_id
        ).first()
        
        if not ticket:
            return {"message": "Ticket not found"}, 404
        
        if ticket.status not in (TicketStatus.COMPLETED, TicketStatus.CLOSED):
            return {"message": "Can only rate completed tickets"}, 400
        
        data = request.get_json()
        rating = data.get('rating')
        comments = data.get('comments', '')
        
        if not rating or not (1 <= int(rating) <= 5):
            return {"message": "Rating must be 1-5"}, 400
        
        try:
            feedback = Feedback(
                ticket_id=ticket_id,
                user_id=user.id,
                rating=int(rating),
                comment=comments,
                account_id=user.account_id,
            )
            
            db.session.add(feedback)
            db.session.commit()
            
            return {
                "message": "Rating submitted successfully",
                "success": True
            }, 201
        
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error submitting rating: {str(e)}", "success": False}, 500

    def patch(self, ticket_id=None):
        if not ticket_id:
            return {"message": "Ticket ID required"}, 400

        user = g.user
        ticket = Ticket.query.filter_by(
            id=ticket_id,
            requester_id=user.id,
            account_id=user.account_id
        ).first()

        if not ticket:
            return {"message": "Ticket not found"}, 404

        data = request.get_json(silent=True) or {}
        status = (data.get("status") or "").strip().lower()

        if status not in {"closed", "close"}:
            return {"message": "Only closing completed tickets is allowed", "success": False}, 403

        if ticket.status != TicketStatus.COMPLETED:
            return {"message": "Ticket must be completed before closing", "success": False}, 400

        try:
            ticket.status = TicketStatus.CLOSED
            ticket.resolved_at = ticket.resolved_at or datetime.now(timezone.utc)

            history = History(
                account_id=user.account_id,
                ticket_id=ticket.id,
                user_id=user.id,
                action="Ticket closed",
                details="Requestor closed the ticket"
            )
            db.session.add(history)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error closing ticket: {str(e)}", "success": False}, 500

        return {"message": "Ticket closed", "success": True}, 200


class RequestorTicketStatusService(Resource):
    """Update ticket status"""
    method_decorators = [
        is_account_active,
        load_user,
        jwt_required(),
    ]

    def patch(self, ticket_id=None):
        if not ticket_id:
            return {"message": "Ticket ID required"}, 400

        user = g.user
        ticket = Ticket.query.filter_by(
            id=ticket_id,
            requester_id=user.id,
            account_id=user.account_id
        ).first()

        if not ticket:
            return {"message": "Ticket not found"}, 404

        data = request.get_json(silent=True) or {}
        status = (data.get("status") or "").strip().lower()

        # Map frontend status values to TicketStatus enum values
        valid_statuses = {
            "new": TicketStatus.NEW,
            "open": TicketStatus.OPEN,
            "assigned": TicketStatus.ASSIGNED,
            "in-progress": TicketStatus.IN_PROGRESS,
            "in_progress": TicketStatus.IN_PROGRESS,
            "onhold": TicketStatus.ON_HOLD,
            "on-hold": TicketStatus.ON_HOLD,
            "on_hold": TicketStatus.ON_HOLD,
            "completed": TicketStatus.COMPLETED,
            "closed": TicketStatus.CLOSED,
            "rejected": TicketStatus.REJECTED,
        }

        if status not in valid_statuses:
            return {
                "message": f"Invalid status. Valid statuses are: new, open, assigned, in-progress, onhold, completed, closed, rejected",
                "success": False
            }, 400

        new_status = valid_statuses[status]

        try:
            old_status = ticket.status
            ticket.status = new_status
            
            # Update resolved_at if transitioning to completed
            if new_status == TicketStatus.COMPLETED and not ticket.resolved_at:
                ticket.resolved_at = datetime.now(timezone.utc)

            history = History(
                account_id=user.account_id,
                ticket_id=ticket.id,
                user_id=user.id,
                action=f"Ticket status changed",
                details=f"Status changed from {old_status.value} to {new_status.value}"
            )
            db.session.add(history)
            db.session.commit()

            return {
                "message": f"Ticket status updated to {new_status.value}",
                "success": True,
                "status": new_status.value,
                "ticket": ticket.to_dict()
            }, 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error updating status: {str(e)}", "success": False}, 500


class RequestorNotificationService(Resource):
    """Get requestor's notifications"""
    method_decorators = [
        is_account_active,
        load_user,
        jwt_required(),
    ]

    def get(self):
        user = g.user
        
        if not _is_requestor(user):
            return {"message": "Unauthorized"}, 403
        
        notifications = Notification.query.filter_by(
            target_user_id=user.id,
            account_id=user.account_id
        ).order_by(Notification.created_at.desc()).all()
        
        return [n.to_dict() for n in notifications], 200
    
    def patch(self, notif_id=None):
        """Mark notification as read"""
        if not notif_id:
            return {"message": "Notification ID required"}, 400
        
        user = g.user
        
        notification = Notification.query.filter_by(
            id=notif_id,
            target_user_id=user.id,
            account_id=user.account_id
        ).first()
        
        if not notification:
            return {"message": "Notification not found"}, 404
        
        notification.is_read = True
        db.session.commit()
        
        return {
            "message": "Notification marked as read",
            "success": True
        }, 200

    def post(self, notif_id=None):
        return self.patch(notif_id=notif_id)

    def delete(self, notif_id=None):
        if not notif_id:
            return {"message": "Notification ID required"}, 400

        user = g.user

        notification = Notification.query.filter_by(
            id=notif_id,
            target_user_id=user.id,
            account_id=user.account_id
        ).first()

        if not notification:
            return {"message": "Notification not found"}, 404

        try:
            db.session.delete(notification)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error deleting notification: {str(e)}", "success": False}, 500

        return {"message": "Notification deleted", "success": True}, 200


class RequestorWorklogViewService(Resource):
    """Create, view, and update worklogs on own tickets"""
    method_decorators = [
        is_account_active,
        load_user,
        jwt_required(),
    ]

    def get(self, ticket_id=None):
        if not ticket_id:
            return {"message": "Ticket ID required"}, 400
        
        user = g.user
        
        ticket = Ticket.query.filter_by(
            id=ticket_id,
            requester_id=user.id,
            account_id=user.account_id
        ).first()
        
        if not ticket:
            return {"message": "Ticket not found"}, 404
        
        worklogs = WorkLog.query.filter_by(
            ticket_id=ticket_id,
            account_id=user.account_id
        ).order_by(WorkLog.created_at.desc()).all()

        return [w.to_dict() for w in worklogs], 200

    def post(self, ticket_id=None):
        if not ticket_id:
            return {"message": "Ticket ID required"}, 400

        user = g.user

        ticket = Ticket.query.filter_by(
            id=ticket_id,
            requester_id=user.id,
            account_id=user.account_id
        ).first()

        if not ticket:
            return {"message": "Ticket not found"}, 404

        data = request.get_json(silent=True) or {}
        message = (data.get("message") or "").strip()

        if not message:
            return {"message": "Message is required", "success": False}, 400

        try:
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
                "message": "Worklog added successfully",
                "success": True,
                "worklog": worklog.to_dict()
            }, 201

        except Exception as e:
            db.session.rollback()
            return {"message": f"Error creating worklog: {str(e)}", "success": False}, 500

    def put(self, ticket_id=None, worklog_id=None):
        """Update an existing worklog"""
        if not ticket_id or not worklog_id:
            return {"message": "Ticket ID and Worklog ID required"}, 400

        user = g.user

        ticket = Ticket.query.filter_by(
            id=ticket_id,
            requester_id=user.id,
            account_id=user.account_id
        ).first()

        if not ticket:
            return {"message": "Ticket not found"}, 404

        worklog = WorkLog.query.filter_by(
            id=worklog_id,
            ticket_id=ticket_id,
            account_id=user.account_id
        ).first()

        if not worklog:
            return {"message": "Worklog not found"}, 404

        data = request.get_json(silent=True) or {}
        message = (data.get("message") or "").strip()

        if not message:
            return {"message": "Message is required"}, 400

        try:
            worklog.description = message
            worklog.title = data.get("title", "Worklog")
            
            db.session.commit()

            return {
                "message": "Worklog updated successfully",
                "success": True,
                "worklog": worklog.to_dict()
            }, 200

        except Exception as e:
            db.session.rollback()
            return {"message": f"Error updating worklog: {str(e)}", "success": False}, 500


class RequestorTaskViewService(Resource):
    """Create, view, update, and delete tasks on own tickets"""
    method_decorators = [
        is_account_active,
        load_user,
        jwt_required(),
    ]

    def get(self, ticket_id=None, task_id=None):
        if not ticket_id:
            return {"message": "Ticket ID required"}, 400
        
        user = g.user
        
        ticket = Ticket.query.filter_by(
            id=ticket_id,
            requester_id=user.id,
            account_id=user.account_id
        ).first()
        
        if not ticket:
            return {"message": "Ticket not found"}, 404
        
        # If task_id is provided, get specific task
        if task_id:
            task = Task.query.filter_by(
                id=task_id,
                ticket_id=ticket_id,
                account_id=user.account_id
            ).first()
            
            if not task:
                return {"message": "Task not found"}, 404
            
            return task.to_dict(), 200
        
        # Otherwise, get all tasks for ticket
        tasks = Task.query.filter_by(
            ticket_id=ticket_id,
            account_id=user.account_id
        ).all()
        return [t.to_dict() for t in tasks], 200

    def post(self, ticket_id=None):
        """Create a new task"""
        if not ticket_id:
            return {"message": "Ticket ID required"}, 400

        user = g.user
        
        ticket = Ticket.query.filter_by(
            id=ticket_id,
            requester_id=user.id,
            account_id=user.account_id
        ).first()

        if not ticket:
            return {"message": "Ticket not found"}, 404

        data = request.get_json(silent=True) or {}
        description = (data.get("description") or data.get("title") or "").strip()

        if not description:
            return {"message": "Description/title is required"}, 400

        try:
            # Get due_at from request or use default (7 days from now)
            due_at = data.get("due_at")
            if due_at:
                from datetime import datetime as dt
                due_at = dt.fromisoformat(due_at.replace('Z', '+00:00')) if isinstance(due_at, str) else due_at
            else:
                from datetime import datetime as dt, timedelta, timezone as tz
                due_at = dt.now(tz.utc) + timedelta(days=7)

            task = Task(
                title=description[:100],  # Truncate to 100 chars for title field
                description=description,
                type=data.get("type"),
                provider=data.get("provider"),
                service=data.get("service"),
                issue=data.get("issue"),
                status=data.get("status", "pending"),
                ticket_id=ticket_id,
                account_id=user.account_id,
                due_at=due_at,
                assigned_to_id=user.id,  # Assign to current user (requestor)
                is_completed=False
            )
            
            db.session.add(task)
            db.session.commit()

            return {
                "message": "Task created successfully",
                "success": True,
                "task": task.to_dict()
            }, 201
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error creating task: {str(e)}", "success": False}, 500

    def put(self, ticket_id=None, task_id=None):
        """Update an existing task"""
        if not ticket_id or not task_id:
            return {"message": "Ticket ID and Task ID required"}, 400

        user = g.user
        
        ticket = Ticket.query.filter_by(
            id=ticket_id,
            requester_id=user.id,
            account_id=user.account_id
        ).first()

        if not ticket:
            return {"message": "Ticket not found"}, 404

        task = Task.query.filter_by(
            id=task_id,
            ticket_id=ticket_id,
            account_id=user.account_id
        ).first()

        if not task:
            return {"message": "Task not found"}, 404

        data = request.get_json(silent=True) or {}
        
        # Update fields if provided
        if "description" in data:
            new_desc = (data.get("description") or "").strip() or task.description
            task.description = new_desc
            task.title = new_desc[:100]
        
        if "type" in data:
            task.type = data.get("type")
        
        if "provider" in data:
            task.provider = data.get("provider")
        
        if "service" in data:
            task.service = data.get("service")
        
        if "issue" in data:
            task.issue = data.get("issue")
        
        if "status" in data:
            task.status = data.get("status")
        
        if "is_completed" in data:
            task.is_completed = bool(data.get("is_completed"))
        elif "completed" in data:
            task.is_completed = bool(data.get("completed"))

        try:
            db.session.commit()

            return {
                "message": "Task updated successfully",
                "success": True,
                "task": task.to_dict()
            }, 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error updating task: {str(e)}", "success": False}, 500

    def delete(self, ticket_id=None, task_id=None):
        """Delete a task"""
        if not ticket_id or not task_id:
            return {"message": "Ticket ID and Task ID required"}, 400

        user = g.user
        
        ticket = Ticket.query.filter_by(
            id=ticket_id,
            requester_id=user.id,
            account_id=user.account_id
        ).first()

        if not ticket:
            return {"message": "Ticket not found"}, 404

        task = Task.query.filter_by(
            id=task_id,
            ticket_id=ticket_id,
            account_id=user.account_id
        ).first()

        if not task:
            return {"message": "Task not found"}, 404

        try:
            db.session.delete(task)
            db.session.commit()

            return {
                "message": "Task deleted successfully",
                "success": True
            }, 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error deleting task: {str(e)}", "success": False}, 500


class RequestorChecklistViewService(Resource):
    """Create and view checklist on own tickets"""
    method_decorators = [
        is_account_active,
        load_user,
        jwt_required(),
    ]

    def get(self, ticket_id=None):
        if not ticket_id:
            return {"message": "Ticket ID required"}, 400
        
        user = g.user
        
        ticket = Ticket.query.filter_by(
            id=ticket_id,
            requester_id=user.id,
            account_id=user.account_id
        ).first()
        
        if not ticket:
            return {"message": "Ticket not found"}, 404
        
        checklist = Checklist.query.filter_by(
            ticket_id=ticket_id,
            account_id=user.account_id
        ).all()
        
        return [{
            "id": c.id,
            "title": c.title,
            "completed": c.is_completed,
            "isCompleted": c.is_completed,
            "assignedTo": "",  # Frontend expects this field
            "dueDate": None    # Frontend expects this field
        } for c in checklist], 200

    def post(self, ticket_id=None):
        """Create a new checklist item"""
        if not ticket_id:
            return {"message": "Ticket ID required"}, 400

        user = g.user
        
        ticket = Ticket.query.filter_by(
            id=ticket_id,
            requester_id=user.id,
            account_id=user.account_id
        ).first()

        if not ticket:
            return {"message": "Ticket not found"}, 404

        data = request.get_json(silent=True) or {}
        title = (data.get("title") or "").strip()

        if not title:
            return {"message": "Title is required"}, 400

        try:
            checklist_item = Checklist(
                name=title[:100],  # Use title as name
                title=title,
                description=data.get("description", ""),
                ticket_id=ticket_id,
                account_id=user.account_id,
                is_completed=False
            )
            
            db.session.add(checklist_item)
            db.session.commit()

            return {
                "message": "Checklist item created successfully",
                "success": True,
                "item": {
                    "id": checklist_item.id,
                    "title": checklist_item.title,
                    "completed": checklist_item.is_completed,
                    "isCompleted": checklist_item.is_completed,
                    "assignedTo": "",  # Frontend expects this field
                    "dueDate": None    # Frontend expects this field
                }
            }, 201
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error creating checklist item: {str(e)}", "success": False}, 500

    def patch(self, ticket_id=None):
        """Update a checklist item completion status"""
        if not ticket_id:
            return {"message": "Ticket ID required"}, 400

        user = g.user
        
        ticket = Ticket.query.filter_by(
            id=ticket_id,
            requester_id=user.id,
            account_id=user.account_id
        ).first()

        if not ticket:
            return {"message": "Ticket not found"}, 404

        data = request.get_json(silent=True) or {}
        item_id = data.get("itemId")
        completed = data.get("completed")

        if item_id is None:
            return {"message": "itemId is required"}, 400

        if not isinstance(completed, bool):
            return {"message": "completed must be a boolean"}, 400

        checklist_item = Checklist.query.filter_by(
            id=item_id,
            ticket_id=ticket_id,
            account_id=user.account_id
        ).first()

        if not checklist_item:
            return {"message": "Checklist item not found"}, 404

        try:
            checklist_item.is_completed = completed
            db.session.commit()

            return {
                "message": "Checklist item updated successfully",
                "success": True,
                "item": {
                    "id": checklist_item.id,
                    "title": checklist_item.title,
                    "completed": checklist_item.is_completed,
                    "isCompleted": checklist_item.is_completed,
                    "assignedTo": "",  # Frontend expects this field
                    "dueDate": None    # Frontend expects this field
                }
            }, 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error updating checklist item: {str(e)}", "success": False}, 500


class RequestorLocationsService(Resource):
    """Return available locations for requestor account"""
    method_decorators = [
        is_account_active,
        load_user,
        jwt_required(),
    ]

    def get(self):
        user = g.user
        rows = (
            db.session.query(User.location)
            .filter(
                User.account_id == user.account_id,
                User.location.isnot(None),
                User.location != ""
            )
            .distinct()
            .all()
        )

        locations = [r[0] for r in rows if r and r[0]]
        default_location = user.location if user.location else (locations[0] if locations else None)

        return {
            "locations": locations,
            "default": default_location,
        }, 200
