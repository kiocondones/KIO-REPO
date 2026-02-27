from flask import g
from flask_restful import Resource
from flask_jwt_extended import jwt_required
from collections import defaultdict

from app.models import Ticket, TicketStatus, SLAPolicy
from app.utils import load_user, is_password_changed, is_account_active


class SLAMonitorService(Resource):
    method_decorators = [
        is_account_active,
        # is_password_changed,
        load_user,
        jwt_required(),
    ]

    def get(self):
        # Active tickets
        active_tickets = Ticket.query.filter(
            Ticket.status.in_([TicketStatus.IN_PROGRESS, TicketStatus.OPEN, TicketStatus.NEW]),
            Ticket.account_id == g.user.account_id
        ).all()
        active_escalation = [t.escalation_level() for t in active_tickets]

        # Resolved tickets
        resolved_tickets = Ticket.query.filter(
            Ticket.resolved_at.isnot(None),
            Ticket.account_id == g.user.account_id
        ).all()

        # Group tickets by SLA policy
        policy_stats = defaultdict(lambda: {"total": 0, "compliant": 0})
        for t in resolved_tickets:
            policy_name = t.priority.name
            policy_stats[policy_name]["total"] += 1
            if (t.resolved_at - t.created_at) <= t.priority.resolution_timedelta():
                policy_stats[policy_name]["compliant"] += 1

        # Prepare SLA compliance & policies data
        sla_policies = SLAPolicy.query.filter_by(account_id=g.user.account_id).all()
        policies_data = []
        for p in sla_policies:
            stats = policy_stats[p.name]
            total = stats["total"]
            compliant = stats["compliant"]
            compliance_percentage = round((compliant / total * 100), 2) if total else 100

            data = p.to_dict()
            data.update({ "compliancePercentage": compliance_percentage })
            policies_data.append(data)

        return {
            "message": "Successfully",
            "success": True,
            "slaCompliance": policies_data,
            "active_escalation": active_escalation
        }, 200
