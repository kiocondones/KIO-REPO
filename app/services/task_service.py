from flask import g, request
from flask_restful import Resource
from datetime import datetime, timezone, timedelta
from flask_jwt_extended import jwt_required

from app.models import Ticket, Task
from app import db
from app.utils import load_user, is_password_changed, is_account_active

class TaskService(Resource):
    method_decorators = [
        is_account_active,
        # is_password_changed,
        load_user,
        jwt_required(),
    ]
    
    # Create Ticket Task
    def post(self, ticket_id=None):
        data = request.get_json()
        
        if not data:
            return {"message": "Invalid JSON payload", "success": False}, 400
        
        title = data.get("title")
        description = data.get("description")
        
        # Validations
        if not title:
            return {"message": "Title is required", "success": False}, 401
        
        if not description:
            return {"message": "Description is required", "success": False}, 400
        
        # Check ticket
        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            return {"message": "Ticket not found", "success": False}, 404
        if ticket.account_id != g.user.account_id:
            return {"message": "Unauthorized", "success": False}, 403

        if not ticket.assigned_to:
            return {"message": "Ticket has no assigned technician", "success": False}, 400
        
        due = datetime.now(timezone.utc) + timedelta(days=3) # Temporary
        
        # Create task
        try:
            task = Task(
                title=title,
                description=description,
                assigned_to=ticket.assigned_to,
                due_at = due,
                ticket=ticket,
                account_id=g.user.account_id,
            )
            
            db.session.add(task)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {"message": f"Database error: {str(e)}", "success": False}, 500
        
        return {"message": "Task created", "success": True, "task": task.to_dict()}, 201
    
    # Updates Ticket Task
    def put(self, ticket_id=None, task_id=None):
        data = request.get_json()
        
        # Validations
        if not data:
            return {"message": "Invalid JSON payload", "success": False}, 400
        
        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            return {"message": "Ticket not found", "success": False}, 404
        if ticket.account_id != g.user.account_id:
            return {"message": "Unauthorized", "success": False}, 403

        if not ticket.assigned_to:
            return {"message": "Ticket has no assigned technician", "success": False}, 400
        
        task = Task.query.filter_by(
            id=task_id,
            ticket_id=ticket.id,
            account_id=g.user.account_id
        ).first()
        if not task:
            return {"message": "Task not found for this ticket", "success": False}, 404

        # task data
        title = data.get("title", task.title)
        description = data.get("description", task.description)
        is_completed = data.get("is_completed", task.is_completed)

        # Update task
        try:
            task.update_task(title, description, is_completed)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {"message": f"Database error: {str(e)}", "success": False}, 500

        return {"message": "Task updated", "success": True, "task": task.to_dict()}, 200
    
    # Deletes Ticket task
    def delete(self, ticket_id, task_id):
        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            return {"message": "Ticket not found", "success": False}, 404
        if ticket.account_id != g.user.account_id:
            return {"message": "Unauthorized", "success": False}, 403

        task = Task.query.filter_by(
            id=task_id,
            ticket_id=ticket.id,
            account_id=g.user.account_id
        ).first()
        if not task:
            return {"message": "Task not found for this ticket", "success": False}, 404

        try:
            db.session.delete(task)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {"message": f"Database error: {str(e)}", "success": False}, 500

        return {"message": "Task deleted", "success": True}, 200