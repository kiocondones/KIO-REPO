from flask import g, request
from flask_restful import Resource
from flask_jwt_extended import jwt_required
from datetime import date
from sqlalchemy import func

from app.models import Ticket, User, Role, TicketStatus
from app import db
from app.utils import load_user, is_password_changed, is_account_active
from app.models import History

class TicketAssignmentService(Resource):
    method_decorators = [
        is_account_active,
        # is_password_changed,
        load_user,
        jwt_required(),
    ]
    
    def get(self):
        unassigned_tickets = Ticket.query.filter_by(
            is_assigned=False,
            account_id=g.user.account_id
        ).all()
        technicians = User.query.join(Role).filter(
            Role.name == "Technician",
            User.account_id == g.user.account_id
        ).all()

        technicians_status = []
        available_technicians = 0
        for t in technicians:
            assigned_count = Ticket.query.filter(
                Ticket.assigned_to_id == t.id,
                Ticket.account_id == g.user.account_id
            ).count()
            
            status = "Off Duty"
            
            if t.is_on_duty:
                status = "Available" if assigned_count < 5 else "Busy"
                available_technicians += 1

            technicians_status.append({
                "id": t.id,
                "name": t.name,
                "department": t.department.name if t.department else None,
                "assignedTickets": assigned_count,
                "status": status
            })
            
        inprogress_tickets = Ticket.query.filter_by(
            status=TicketStatus.IN_PROGRESS,
            account_id=g.user.account_id
        ).count()
        
        today = date.today()

        resolved_today = Ticket.query.filter(
            func.date(Ticket.resolved_at) == today,
            Ticket.account_id == g.user.account_id
        ).count()
        
        return {
            "success": True,
            "unassignedTickets": [ut.ticketPreview() for ut in unassigned_tickets],
            "technicians": technicians_status,
            "Unassigned": len(unassigned_tickets),
            "availableTechs": available_technicians,
            "inProgress": inprogress_tickets,
            "completedToday": resolved_today
        }, 200
        
    def patch(self):
        data = request.get_json(silent=True)

        if not data:
            return {"success": False, "message": "Invalid JSON body"}, 400

        assignments = data.get("tickets")  # [{ "ticketId": 1, "technicianId": 2 }]

        if assignments is None:
            return {"success": False, "message": "`tickets` is required"}, 400

        if not isinstance(assignments, list):
            return {"success": False, "message": "`tickets` must be a list"}, 400

        if not assignments:
            return {"success": False, "message": "`tickets` cannot be empty"}, 400

        for index, item in enumerate(assignments):
            if not isinstance(item, dict):
                return {
                    "success": False,
                    "message": f"tickets[{index}] must be an object"
                }, 400

            ticket_id = item.get("ticketId")
            technician_id = item.get("technicianId")

            if not ticket_id or not technician_id:
                return {
                    "success": False,
                    "message": f"tickets[{index}] must contain ticketId and technicianId"
                }, 400

            ticket = Ticket.query.get(ticket_id)
            if not ticket:
                return {
                    "success": False,
                    "message": f"Ticket with id {ticket_id} not found"
                }, 404
            if ticket.account_id != g.user.account_id:
                return {"success": False, "message": "Unauthorized"}, 403

            if ticket.is_assigned:
                return {
                    "success": False,
                    "message": f"Ticket {ticket_id} is already assigned"
                }, 400

            technician = User.query.get(technician_id)
            if not technician:
                return {
                    "success": False,
                    "message": f"User with id {technician_id} not found"
                }, 404

            if not technician.role or technician.role.name != "Technician":
                return {
                    "success": False,
                    "message": f"User {technician_id} is not a technician"
                }, 400

            ticket.assigned_to = technician
            ticket.assigned_to_id = technician.id
            ticket.assigned_by = g.user
            ticket.is_assigned = True
            ticket.status = TicketStatus.ASSIGNED

            history = History(
                account_id=g.user.account_id,
                ticket_id=ticket.id,
                user_id=g.user.id,
                action="Ticket assigned",
                details=f"Assigned to {technician.name}"
            )
            db.session.add(ticket)
            db.session.add(history)
            db.session.commit()

        return {
            "success": True,
            "message": "Tickets successfully assigned"
        }, 200
