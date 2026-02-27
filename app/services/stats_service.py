from flask import g
from flask_restful import Resource
from flask_jwt_extended import jwt_required

from app.utils import load_user, is_password_changed, is_account_active
from app.models import Ticket, TicketStatus

OPEN_STATUSES = {
    TicketStatus.NEW,
    TicketStatus.OPEN,
    TicketStatus.ASSIGNED,
    TicketStatus.IN_PROGRESS,
    TicketStatus.ON_HOLD,
}

COMPLETED_STATUSES = {
    TicketStatus.COMPLETED,
    TicketStatus.CLOSED,
    TicketStatus.REJECTED,
}

class StatsService(Resource):
    method_decorators = [
        is_account_active,
        load_user,
        jwt_required(),
    ]
    
    def get(self):
        user = g.user

        open_tickets = Ticket.query.filter(
            Ticket.requester_id == user.id,
            Ticket.account_id == user.account_id,
            Ticket.status.in_(OPEN_STATUSES)
        ).count()

        in_progress = Ticket.query.filter(
            Ticket.requester_id == user.id,
            Ticket.account_id == user.account_id,
            Ticket.status == TicketStatus.IN_PROGRESS
        ).count()

        completed = Ticket.query.filter(
            Ticket.requester_id == user.id,
            Ticket.account_id == user.account_id,
            Ticket.status.in_(COMPLETED_STATUSES)
        ).count()

        return {
            "openTickets": open_tickets,
            "inProgress": in_progress,
            "completed": completed,
            "totalSpent": 0,
            "ytdExpenses": 0,
            "mtdExpenses": 0
        }, 200