from datetime import timezone, datetime
from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required

from app.models import Reminder, ReminderPriority, Ticket, User, Task, Department
from app import db
from app.socket import send_reminder
from app.utils import load_user, is_password_changed, is_account_active
 
class ReminderRequests(Resource):
    method_decorators = [
        is_account_active,
        # is_password_changed,
        load_user,
        jwt_required(),
    ]
    
    def get(self):
        reminders = Reminder.query.filter_by(account_id=g.user.account_id).all()
        
        return {
            "message": "Successful",
            "success": True,
            "reminders": [r.to_dict() for r in reminders]
        }, 200
        
    def post(self):
        data = request.get_json()

        title = data.get("title")
        description = data.get("description")
        reminder_type = data.get("reminder_type")
        priority = data.get("priority")
        scheduled_at = data.get("scheduleAt") 
        all_day_event = data.get("allDayEvent")
        repeat_reminder = data.get("repeatReminder")
        target_type = data.get("targetType")
        target = data.get("target")

        # Validations
        if not title:
            return {"message": "Title is required", "success": False}, 400
        if not description:
            return {"message": "Description is required", "success": False}, 400
        if not reminder_type:
            return {"message": "Reminder type is required", "success": False}, 400
        if not priority:
            return {"message": "Priority is required", "success": False}, 400
        if not scheduled_at:
            return {"message": "Due date is required", "success": False}, 400
        if not target_type:
            return {"message": "Target type is required", "success": False}, 400
        if not target:
            return {"message": "Target id is required", "success": False}, 400
        
        try:
            scheduled_at = datetime.fromisoformat(
                str(scheduled_at).replace("Z", "+00:00")
            )
            if scheduled_at.tzinfo is None:
                scheduled_at = scheduled_at.replace(tzinfo=timezone.utc)
        except (TypeError, ValueError):
            return {
                "message": "Invalid dueDate format. Use ISO 8601.",
                "success": False
            }, 400
        
        now = datetime.now(timezone.utc)
        if now > scheduled_at:
            return {"message": "Due date must be in the future", "success": False}, 400
        
        try:
            reminder = Reminder(
                title=title,
                description=description,
                reminder_type=reminder_type,
                priority=priority,
                scheduled_at=scheduled_at,
                all_day_event=all_day_event,
                repeat_reminder=repeat_reminder,
                target_type=target_type,
                account_id=g.user.account_id,
            )

            if target_type.lower() == "user":
                user = User.query.get(target)
                if not user:
                    return {"message": "User not found", "success": False}, 404
                if user.account_id != g.user.account_id:
                    return {"message": "Unauthorized", "success": False}, 403
                reminder.target_user_id = user.id

            elif target_type.lower() == "department":
                dept = Department.query.get(target)
                if not dept:
                    return {"message": "Department not found", "success": False}, 404
                if dept.account_id != g.user.account_id:
                    return {"message": "Unauthorized", "success": False}, 403
                reminder.target_department_id = dept.id

            elif target_type.lower() == "ticket":
                ticket = Ticket.query.get(target)
                if not ticket:
                    return {"message": "Ticket not found", "success": False}, 404
                if ticket.account_id != g.user.account_id:
                    return {"message": "Unauthorized", "success": False}, 403
                reminder.target_ticket_id = ticket.id

            elif target_type.lower() == "task":
                task = Task.query.get(target)
                if not task:
                    return {"message": "Task not found", "success": False}, 404
                if task.account_id != g.user.account_id:
                    return {"message": "Unauthorized", "success": False}, 403
                reminder.target_task_id = task.id

            else:
                return {"message": "Invalid target type", "success": False}, 400

            db.session.add(reminder)
            db.session.commit()
            
            if reminder.target_type == "user":
                send_reminder(reminder=reminder, user_id=reminder.target_user_id)

            return {
                "message": "Reminder created successfully",
                "success": True,
                "reminder": reminder.to_dict()
            }, 201
        except Exception as e:
            db.session.rollback()
            return {
                "message": f"Failed to create reminder: {str(e)}",
                "success": False
            }, 500
            
    def put(self, reminder_id=None):
        data = request.get_json()
        
        reminder = Reminder.query.get(reminder_id)
        
        if not reminder:
            return {
                "message": "Reminder not found",
                "success": False
            }, 404
        if reminder.account_id != g.user.account_id:
            return {"message": "Unauthorized", "success": False}, 403

        title = data.get("title", reminder.title)
        description = data.get("description", reminder.description)
        reminder_type = data.get("type", reminder.reminder_type)
        priority_input = data.get("priority", reminder.priority)
        due_date = data.get("dueDate", reminder.scheduled_at)
        
        try:
            due_date = datetime.fromisoformat(
                str(due_date).replace("Z", "+00:00")
            )
            if due_date.tzinfo is None:
                due_date = due_date.replace(tzinfo=timezone.utc)
        except (TypeError, ValueError):
            return {
                "message": "Invalid dueDate format. Use ISO 8601.",
                "success": False
            }, 400
        
        now = datetime.now(timezone.utc)
        if now > due_date and due_date != reminder.scheduled_at:
            return {"message": "Due date must be in the future", "success": False}, 400

        if isinstance(priority_input, ReminderPriority):
            priority = priority_input
        else:
            try:
                priority = ReminderPriority(str(priority_input).lower())
            except ValueError:
                return {
                    "message": f"Invalid priority. Allowed values: {[p.value for p in ReminderPriority]}",
                    "success": False
                }, 400

        try:
            reminder.update_reminder(title, description, reminder_type, priority, due_date)
            db.session.commit()

            return {
                "message": "Reminder updated successfully",
                "success": True,
                "reminder": reminder.to_dict()
            }, 200
        except Exception as e:
            db.session.rollback()
            return {
                "message": f"Failed to update reminder: {str(e)}",
                "success": False
            }, 500
            
    def delete(self, reminder_id=None):
        reminder = Reminder.query.get(reminder_id)
        
        if not reminder:
            return {
                "message": "Reminder not found",
                "success": False,
            }, 404
        if reminder.account_id != g.user.account_id:
            return {"message": "Unauthorized", "success": False}, 403
        
        try:
            db.session.delete(reminder)
            db.session.commit()

            return {
                "message": "Reminder deleted successfully",
                "success": True,
            }, 200
        except Exception as e:
            db.session.rollback()
            return {
                "message": f"Failed to delete reminder: {str(e)}",
                "success": False
            }, 500