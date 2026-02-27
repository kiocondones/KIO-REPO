from flask import g, request
from flask_restful import Resource
from flask_jwt_extended import jwt_required

from app.models import Resolution, Ticket
from app import db
from app.utils import load_user, is_password_changed, is_account_active


class ResolutionService(Resource):
    method_decorators = [
        is_account_active,
        # is_password_changed,
        load_user,
        jwt_required(),
    ]

    def post(self, ticket_id=None):
        data = request.get_json(silent=True)

        if not data:
            return {"message": "Invalid JSON payload", "success": False}, 400

        description = data.get("description")
        draft = data.get("draft", False)
        if not description:
            return {"message": "Description is required", "success": False}, 400

        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            return {"message": "Ticket not found", "success": False}, 404
        if ticket.account_id != g.user.account_id:
            return {"message": "Unauthorized", "success": False}, 403

        try:
            resolution = Resolution(
                description=description,
                ticket=ticket,
                is_draft=draft,
                account_id=g.user.account_id,
            )

            db.session.add(resolution)
            db.session.commit()

            return {
                "success": True,
                "message": "Resolution created successfully",
                "resolution": resolution.to_dict(),
            }, 201

        except Exception as e:
            db.session.rollback()
            return {
                "message": "Database error",
                "error": str(e),
                "success": False,
            }, 500

    def put(self, ticket_id=None, resolution_id=None):
        data = request.get_json(silent=True)

        if not data:
            return {"message": "Invalid JSON payload", "success": False}, 400

        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            return {"message": "Ticket not found", "success": False}, 404
        if ticket.account_id != g.user.account_id:
            return {"message": "Unauthorized", "success": False}, 403

        resolution = Resolution.query.get(resolution_id)
        if not resolution or resolution.ticket_id != ticket.id:
            return {
                "message": "Resolution not found for this ticket",
                "success": False,
            }, 404
        if resolution.account_id != g.user.account_id:
            return {"message": "Unauthorized", "success": False}, 403
            
        draft = data.get("draft", resolution.is_draft)
        description = data.get("description", resolution.description)
        if not description:
            return {"message": "Description is required", "success": False}, 400

        try:
            resolution.description = description
            resolution.is_draft = draft
            db.session.commit()

            return {
                "success": True,
                "message": "Resolution updated successfully",
                "resolution": resolution.to_dict(),
            }, 200

        except Exception as e:
            db.session.rollback()
            return {
                "message": "Database error",
                "error": str(e),
                "success": False,
            }, 500
