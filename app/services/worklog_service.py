from flask import g, request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models import Ticket, WorkLog, User, WorkLogMessage
from app import db
from app.utils import load_user, is_password_changed, is_account_active

class WorkLogService(Resource):
    method_decorators = [
        is_account_active,
        # is_password_changed,
        load_user,
        jwt_required(),
    ]
    
    def post(self, ticket_id):
        data = request.get_json(silent=True)
        
        if not data:
            return {"message": "Invalid JSON payload", "success": False}, 400

        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            return { "message": "Ticket not found", "success": False }, 404
        if ticket.account_id != g.user.account_id:
            return {"message": "Unauthorized", "success": False}, 403
        
        title = data.get("title")
        description = data.get("description")
        
        if not title:
            return {"message": "Title is required", "success": False}, 400
        
        if not description:
            return {"message": "Description is required", "success": False}, 400

        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        try:
            worklog = WorkLog(
                title=title,
                description=description,
                ticket=ticket,
                author=user,
                account_id=user.account_id,
            )

            db.session.add(worklog)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {"message": f"Database error: {str(e)}", "success": False}, 500

        return {
            "message": "Successfully created WorkLog",
            "success": True,
            "workLog": worklog.to_dict()
        }, 201

    def put(self, ticket_id, worklog_id=None):
        if not worklog_id:
            return {"message": "WorkLog ID required", "success": False}, 400

        data = request.get_json(silent=True) or {}
        message = (data.get("message") or "").strip()
        if not message:
            return {"message": "Message is required", "success": False}, 400

        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            return {"message": "Ticket not found", "success": False}, 404
        if ticket.account_id != g.user.account_id:
            return {"message": "Unauthorized", "success": False}, 403

        worklog = WorkLog.query.filter_by(
            id=worklog_id,
            ticket_id=ticket_id,
            account_id=g.user.account_id
        ).first()

        if not worklog:
            return {"message": "WorkLog not found", "success": False}, 404

        if worklog.author_id != g.user.id:
            return {"message": "You are not allowed to edit this worklog", "success": False}, 403

        try:
            worklog.description = message
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {"message": f"Database error: {str(e)}", "success": False}, 500

        return {
            "message": "WorkLog updated successfully",
            "success": True,
            "workLog": worklog.to_dict()
        }, 200


class WorkLogCommentService(Resource):
    method_decorators = [
        is_account_active,
        load_user,
        jwt_required(),
    ]

    def get(self, ticket_id, worklog_id):
        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            return {"message": "Ticket not found", "success": False}, 404
        if ticket.account_id != g.user.account_id:
            return {"message": "Unauthorized", "success": False}, 403

        worklog = WorkLog.query.filter_by(
            id=worklog_id,
            ticket_id=ticket_id,
            account_id=g.user.account_id
        ).first()

        if not worklog:
            return {"message": "WorkLog not found", "success": False}, 404

        comments = WorkLogMessage.query.filter_by(
            worklog_id=worklog_id,
            account_id=g.user.account_id,
            parent_id=None
        ).order_by(WorkLogMessage.created_at.asc()).all()

        return [
            {
                "id": c.id,
                "author": c.author.name,
                "message": c.text,
                "created_at": c.created_at.isoformat(),
            }
            for c in comments
        ], 200

    def post(self, ticket_id, worklog_id):
        data = request.get_json(silent=True) or {}
        message = (data.get("message") or "").strip()

        if not message:
            return {"message": "Message is required", "success": False}, 400

        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            return {"message": "Ticket not found", "success": False}, 404
        if ticket.account_id != g.user.account_id:
            return {"message": "Unauthorized", "success": False}, 403

        worklog = WorkLog.query.filter_by(
            id=worklog_id,
            ticket_id=ticket_id,
            account_id=g.user.account_id
        ).first()

        if not worklog:
            return {"message": "WorkLog not found", "success": False}, 404

        try:
            comment = WorkLogMessage(
                text=message,
                author=g.user,
                worklog=worklog,
                account_id=g.user.account_id,
            )

            db.session.add(comment)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {"message": f"Database error: {str(e)}", "success": False}, 500

        return {
            "message": "Comment added successfully",
            "success": True,
            "comment": {
                "id": comment.id,
                "author": comment.author.name,
                "message": comment.text,
                "created_at": comment.created_at.isoformat(),
            },
        }, 201
        
class ServiceManagementWorkLogReply(Resource):
    method_decorators = [jwt_required()]
    
    def post(self, ticket_id, worklog_id, reply_id=None):
        data = request.get_json(silent=True)
        
        if not data:
            return {"message": "Invalid JSON payload", "success": False}, 400

        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            return {
                "message": "Ticket not found",
                "success": False
            }, 404
        if ticket.account_id != g.user.account_id:
            return {"message": "Unauthorized", "success": False}, 403

        worklog = WorkLog.query.filter_by(
            id=worklog_id,
            ticket_id=ticket_id
        ).first()

        if not worklog:
            return {
                "message": "Work Log not found for this ticket",
                "success": False
            }, 404
            
        text = data.get("text")
        if not text:
            return {"message": "Message is required", "success": False}, 400

        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        parent_reply = None

        if reply_id:
            parent_reply = WorkLogMessage.query.filter_by(
                id=reply_id,
                worklog_id=worklog_id
            ).first()

            if not parent_reply:
                return {
                    "message": "Parent reply not found for this work log",
                    "success": False
                }, 404

        try:
            reply = WorkLogMessage(
                text=text,
                author=user,
                worklog=worklog,
                parent=parent_reply,
                account_id=user.account_id,
            )

            db.session.add(reply)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {"message": f"Database error: {str(e)}", "success": False}, 500

        return {
            "message": "Reply created successfully",
            "success": True,
            "data": reply.to_dict()
        }, 201
        
    def delete(self, ticket_id, worklog_id, reply_id):
        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            return {"message": "Ticket not found", "success": False}, 404

        worklog = WorkLog.query.filter_by(
            id=worklog_id,
            ticket_id=ticket_id
        ).first()

        if not worklog:
            return {
                "message": "Work Log not found for this ticket",
                "success": False
            }, 404

        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        reply = WorkLogMessage.query.filter_by(
            id=reply_id,
            worklog_id=worklog_id
        ).first()

        if not reply:
            return {
                "message": "Reply not found for this work log",
                "success": False
            }, 404

        if reply.author_id != user.id:
            return {
                "message": "You are not allowed to delete this reply",
                "success": False
            }, 403

        try:
            db.session.delete(reply)
            db.session.commit()

        except Exception as e:
            db.session.rollback()
            return {"message": f"Database error: {str(e)}", "success": False}, 500

        return {
            "message": "Reply deleted successfully",
            "success": True
        }, 200