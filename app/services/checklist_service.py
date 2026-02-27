from flask import g, request
from flask_restful import Resource
from flask_jwt_extended import jwt_required

from app.models import Ticket, CheckList
from app import db
from app.utils import load_user, is_password_changed, is_account_active


class CheckListService(Resource):
    method_decorators = [
        is_account_active,
        # is_password_changed,
        load_user,
        jwt_required(),
    ]
    
    def post(self, ticket_id):
        data = request.get_json()
        
        if not data:
            return {"message": "Invalid JSON payload", "success": False}, 400
        
        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            return {"message": "Ticket not found", "success": False}, 404
        if ticket.account_id != g.user.account_id:
            return {"message": "Unauthorized", "success": False}, 403
        
        name = data.get("name")
        title = data.get("title")
        description = data.get("description")
        
        if not name:
            return {"message": "Name is required", "success": False}, 400
        
        if not title:
            return {"message": "Title is required", "success": False}, 400
        
        if not description:
            return {"message": "Description is required", "success": False}, 400
        
        try:
            checlist = CheckList(
                name = name,
                title = title,
                description = description,
                ticket = ticket,
                account_id=g.user.account_id,
            )
            
            db.session.add(checlist)
            db.session.commit()
        except Exception as e:
                db.session.rollback()
                return {"message": f"Database error: {str(e)}", "success": False}, 500
        
        return {
            "message": "Successfully created Checklist",
            "success": True,
            "checklist": checlist.to_dict()
        }, 201
        
    def put(self, ticket_id=None, checklist_id=None):
        data = request.get_json()
        
        if not data:
            return {"message": "Invalid JSON payload", "success": False}, 400
        
        checklist = CheckList.query.filter_by(
            id=checklist_id,
            ticket_id=ticket_id,
            account_id=g.user.account_id
        ).first()
        ticket = Ticket.query.get(ticket_id)
        
        if not ticket:
            return {"message": "Ticket not found", "success": False}, 404
        if ticket.account_id != g.user.account_id:
            return {"message": "Unauthorized", "success": False}, 403
        
        if not checklist:
            return {"message": "Checklist not found for this ticket", "success": False}, 404
        
        name = data.get("name") or checklist.name
        title = data.get("title") or checklist.title
        description = data.get("description") or checklist.description
        is_completed = data.get("is_completed") or checklist.is_completed
        
        try:
            checklist.update_checklist(name,title,description,is_completed)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {"message": f"Database error: {str(e)}", "success": False}, 500
        
    
        return {"message": "Task updated", "success": True, "task": checklist.to_dict()}, 200

    def patch(self, ticket_id=None):
        data = request.get_json(silent=True) or {}
        item_id = data.get("itemId")
        completed = data.get("completed")

        if item_id is None:
            return {"message": "itemId is required", "success": False}, 400

        if not isinstance(completed, bool):
            return {"message": "completed must be a boolean", "success": False}, 400

        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            return {"message": "Ticket not found", "success": False}, 404
        if ticket.account_id != g.user.account_id:
            return {"message": "Unauthorized", "success": False}, 403

        checklist = CheckList.query.filter_by(
            id=item_id,
            ticket_id=ticket_id,
            account_id=g.user.account_id
        ).first()

        if not checklist:
            return {"message": "Checklist not found for this ticket", "success": False}, 404

        try:
            checklist.is_completed = completed
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {"message": f"Database error: {str(e)}", "success": False}, 500

        return {"message": "Checklist updated", "success": True, "item": checklist.to_dict()}, 200
        
    def delete(self, ticket_id, checklist_id):
        ticket = Ticket.query.get(ticket_id)
        
        if not ticket:
            return {"message": "Ticket not found", "success": False}, 404
        
        checklist = CheckList.query.filter_by(
            id=checklist_id,
            ticket_id=ticket_id,
            account_id=g.user.account_id
        ).first()
        if not checklist:
            return {"message": "Checklist not found for this ticket", "success": False}, 404
        
        try:
            db.session.delete(checklist)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {"message": f"Database error: {str(e)}", "success": False}, 500

        return {"message": "Task deleted", "success": True}, 200