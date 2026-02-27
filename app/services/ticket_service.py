from flask import request, g
from flask_restful import Resource
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename
import os
import uuid

from app.utils import load_user, is_password_changed, is_account_active
from app.models import Ticket, User, TicketStatus, TicketTemplate, History, File
from app import db
from app.utils import generate_id

class TicketService(Resource):
    method_decorators = [
        is_account_active,
        # is_password_changed,
        load_user,
        jwt_required(),
    ]

    def get(self, ticket_id=None):
        user = g.user

        # VIEWER ROLE
        if user.role and user.role.name.lower() == "viewer":
            if ticket_id:
                ticket = Ticket.query.filter_by(
                    id=ticket_id,
                    requester_id=user.id,
                    account_id=user.account_id
                ).first()
                if not ticket:
                    return {"message": "Ticket not found"}, 404
                
                return ticket.to_dict(), 200

            # Viewer list → only own tickets
            tickets = Ticket.query.filter_by(
                requester_id=user.id,
                account_id=user.account_id
            ).all()
            return [t.to_dict() for t in tickets], 200

        # Admin role
        if ticket_id:
            ticket = Ticket.query.filter_by(
                id=ticket_id,
                account_id=user.account_id
            ).first()
            if not ticket:
                return {"message": "Ticket not found"}, 404
            return ticket.to_dict(), 200

        tickets = Ticket.query.filter_by(account_id=user.account_id).all()
        return [t.to_dict() for t in tickets], 200

    def post(self, ticket_id=None, technician_id=None):
        if technician_id or ticket_id:
            return {"message": "The method is not allowed for the requested URL.", "success": False}, 405

        # Ticket Details
        description = request.form.get("description")
        templateId = request.form.get("templateId")
        requester_id = request.form.get("requesterId")
        attachments = request.files.getlist("attachments")

        # Required fields
        if not description:
            return {"message": "Description is required", "success": False}, 400
        if not templateId:
            return {"message": "Service is required", "success": False}, 400
        
        # Requester details
        requester = g.user
        if requester_id:
            # Only admin or manager can create tickets for others
            if g.user.role.name.lower() not in ("admin", "manager"):
                return {"message": "You cannot create tickets for other users", "success": False}, 403
            
            requester = User.query.get(requester_id)
            
            if not requester:
                return {"message": "Requester not found", "success": False}, 400
        
        # Ticket Template
        ticket_template = TicketTemplate.query.get(templateId)
        if not ticket_template:
            return {
                "message": "Service not found",
                "success": False
            }, 400
        
        priority = ticket_template.priority
        ticket_type = ticket_template.ticket_type

        # Creating the ticket
        try:
            ticket_id = generate_id(account_id=g.user.account_id)
            
            ticket = Ticket(
                id=ticket_id,
                account_id=g.user.account_id,
                title=ticket_template.service,
                description=description,
                priority=priority,
                location=requester.location,
                requester=requester,
                ticket_type=ticket_type,
                template=ticket_template,
                service_category_id=ticket_template.category_id,
                service_provider_id=ticket_template.category.department_id,
                is_assigned=False,
            )

            db.session.add(ticket)
            
            # Adding history
            history = History(
                account_id=g.user.account_id,
                action="Ticket created",
                details="Service request created",
                ticket=ticket,
                user_id=g.user.id,
            )
            
            # Saving the new ticket
            db.session.add(history)
            db.session.commit()
            
            # Files location
            os.makedirs("app/uploads/", exist_ok=True)

            # Saving the files
            saved_files = []
            for f in attachments:
                filename = f"{uuid.uuid4().hex}_{secure_filename(f.filename)}"
                filepath = os.path.join("app/uploads/", filename)
                f.save(filepath)
                saved_files.append({
                    "filename": filename,
                    "location": filepath,
                    "size": os.path.getsize(filepath),
                    "mimetype": f.mimetype
                })
            
            # Adding relation of files to 
            for file_data in saved_files:
                file_record = File(
                    filename=file_data["filename"],
                    location=file_data["location"],
                    size=file_data["size"],
                    mimetype=file_data["mimetype"],
                    ticket=ticket,
                    account_id=g.user.account_id,
                )
                db.session.add(file_record)
                db.session.commit()

            return {
                "message": "Ticket created successfully",
                "ticket": ticket.to_dict(),
                "success": True,
            }, 201
        except Exception as e:
            db.session.rollback()
            return {"message": f"Database error: {str(e)}", "success": False}, 500
        
    def patch(self, ticket_id = None, technician_id = None):
        ticket = Ticket.query.get(ticket_id)
        technician = User.query.get(technician_id)

        if not ticket:
            return {"message": "Ticket not found", "success": False}, 404
        if not technician:
            return {"message": "Technician not found", "success": False}, 404
        if ticket.account_id != g.user.account_id or technician.account_id != g.user.account_id:
            return {"message": "Unauthorized", "success": False}, 403

        try:
            if ticket.assigned_to_id == technician.id:
                return {"message": "Ticket already assigned to this technician", "success": False}, 400
            
            ticket.assigned_to = technician
            ticket.assigned_by = g.user
            ticket.is_assigned = True
            ticket.status = TicketStatus.IN_PROGRESS
            
            print(TicketStatus.IN_PROGRESS.name)
            history = History(
                account_id=g.user.account_id,
                action="Ticket assigned",
                details=f"Assigned to {technician.name}",
                ticket=ticket,
                user_id=g.user.id,
            )
            
            db.session.add(history)
            db.session.commit()
            
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {"message": f"Database error: {str(e)}", "success": False}, 500
        
        return {"message": "Ticket assigned", "success": True}, 200
    
class AssignedTicketService(Resource):
    method_decorators = [
        is_account_active,
        # is_password_changed,
        load_user,
        jwt_required(),
    ]
    
    def get(self, ticket_id=None):
        user = g.user

        # Admin role
        if ticket_id:
            ticket = Ticket.query.filter_by(
                id=ticket_id,
                assigned_to_id=user.id,
                account_id=user.account_id
            ).first()
            if not ticket:
                return {"message": "Ticket not found"}, 404
            return ticket.to_dict(), 200

        tickets = Ticket.query.filter_by(
            assigned_to_id=user.id,
            account_id=user.account_id
        ).all()
        return [t.to_dict() for t in tickets], 200
    
        
class ForApprovalService(Resource):
    method_decorators = [
        is_account_active,
        load_user,
        jwt_required(),
    ]
    
    def get(self, ticket_id=None):
        if ticket_id:
            ticket = Ticket.query.filter_by(
                id=ticket_id,
                account_id=g.user.account_id
            ).first()
            
            if not ticket:
                return {
                    "message": "Ticket not found",
                    "success": False
                }, 404
                
            return {
                "message": "Successful",
                "success": True,
                "tickets": ticket.to_dict()
            }
        
        tickets = Ticket.query.filter_by(
            status=TicketStatus.NEW,
            account_id=g.user.account_id
        ).all()
        
        return {
            "message": "Successful",
            "success": True,
            "tickets": [t.to_dict() for t in tickets]
        }, 200
        
    def patch(self, ticket_id=None):
        data = request.get_json()
        action = data.get("action", "").lower()

        if action not in ("approve", "reject"):
            return {"message": "Invalid action. Must be 'approve' or 'reject'.", "success": False}, 400

        ticket = Ticket.query.filter_by(
            id=ticket_id,
            account_id=g.user.account_id
        ).first()
        if not ticket:
            return {"message": "Ticket not found", "success": False}, 404

        try:
            if action == "approve":
                ticket.status = TicketStatus.OPEN
            elif action == 'reject':
                ticket.status = TicketStatus.REJECTED
                
            db.session.commit()
            return {"message": "Ticket approved", "success": True, "ticket": ticket.to_dict()}, 200

        except Exception as e:
            db.session.rollback()
            return {"message": f"Failed to process action: {str(e)}", "success": False}, 500