"""
app/api/technician/routes.py

Registers all technician endpoints onto the shared Flask-RESTful Api.
Called by app/__init__.py as:  technician_routes(rest_api)

All endpoints — including notifications, stats, and account-request — are
implemented as proper Resource classes so they work identically to every
other route in this codebase.
"""

from flask import request, jsonify, g
from flask_restful import Api, Resource
from flask_jwt_extended import jwt_required
from datetime import datetime, timezone

from app.services.technician_service import (
    TechnicianDashboardService,
    TechnicianTicketService,
    TechnicianWorklogService,
    TechnicianTaskService,
    TechnicianChecklistService,
)
from app.models import (
    AccountRequest, AccountRequestStatus,
    Role, Department,
    Notification,
    Ticket, TicketStatus,
    History,
)
from app.utils import load_user, is_account_active
from app import db


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------
class TechnicianNotificationService(Resource):
    method_decorators = [
        is_account_active,
        load_user,
        jwt_required(),
    ]

    def get(self):
        user = g.user
        notifications = (
            Notification.query
            .filter_by(target_user_id=user.id, account_id=user.account_id)
            .order_by(Notification.created_at.desc())
            .all()
        )
        unread_count = sum(1 for n in notifications if not n.is_read)
        return {
            "notifications": [n.to_dict() for n in notifications],
            "unreadCount": unread_count,
        }, 200


class TechnicianNotificationReadService(Resource):
    method_decorators = [
        is_account_active,
        load_user,
        jwt_required(),
    ]

    def patch(self, notif_id):
        user = g.user
        notif = Notification.query.filter_by(
            id=notif_id,
            target_user_id=user.id,
            account_id=user.account_id,
        ).first()
        if not notif:
            return {"error": "Notification not found"}, 404
        notif.is_read = True
        db.session.commit()
        return {"success": True}, 200


# ---------------------------------------------------------------------------
# Stats / Performance
# ---------------------------------------------------------------------------
class TechnicianStatsService(Resource):
    method_decorators = [
        is_account_active,
        load_user,
        jwt_required(),
    ]

    def get(self):
        user = g.user
        now  = datetime.now(timezone.utc)

        assigned = Ticket.query.filter_by(
            assigned_to_id=user.id,
            account_id=user.account_id,
        ).all()

        completed   = [t for t in assigned if t.status in (TicketStatus.COMPLETED, TicketStatus.CLOSED)]
        in_progress = [t for t in assigned if t.status == TicketStatus.IN_PROGRESS]
        open_t      = [t for t in assigned if t.status in (TicketStatus.OPEN, TicketStatus.NEW, TicketStatus.ASSIGNED)]

        this_month_assigned  = [t for t in assigned  if t.created_at.year == now.year and t.created_at.month == now.month]
        this_month_completed = [t for t in completed if t.resolved_at and t.resolved_at.year == now.year and t.resolved_at.month == now.month]

        monthly_total   = len(this_month_assigned)
        performance_pct = round(len(this_month_completed) / monthly_total * 100) if monthly_total else 0

        resolution_times = [
            (t.resolved_at - t.created_at).total_seconds() / 60
            for t in completed if t.resolved_at and t.created_at
        ]
        avg_resolution = round(sum(resolution_times) / len(resolution_times)) if resolution_times else 0

        ratings = [
            t.feedback.rating for t in completed
            if hasattr(t, "feedback") and t.feedback and t.feedback.rating
        ]
        avg_rating = round(sum(ratings) / len(ratings), 1) if ratings else 0.0

        ticket_ids = [t.id for t in assigned]
        recent_history = (
            History.query
            .filter(History.ticket_id.in_(ticket_ids), History.account_id == user.account_id)
            .order_by(History.created_at.desc())
            .limit(10)
            .all()
        ) if ticket_ids else []

        def fmt_time(dt):
            if not dt:
                return ""
            return dt.strftime("%I:%M %p").lstrip("0") or dt.strftime("%I:%M %p")

        return {
            "performance":          performance_pct,
            "jobsCompleted":        len(this_month_completed),
            "totalCompleted":       len(completed),
            "inProgress":           len(in_progress),
            "open":                 len(open_t),
            "avgResolutionMinutes": avg_resolution,
            "avgRating":            avg_rating,
            "recentActivity": [
                {
                    "id":        h.id,
                    "action":    h.action,
                    "details":   h.details,
                    "ticketId":  h.ticket_id,
                    "time":      fmt_time(h.created_at),
                    "timestamp": h.created_at.isoformat() if h.created_at else "",
                }
                for h in recent_history
            ],
        }, 200


# ---------------------------------------------------------------------------
# Account Request (no auth — pre-login screen)
# ---------------------------------------------------------------------------
class TechnicianAccountRequestService(Resource):

    def post(self):
        data = request.get_json(silent=True) or {}

        name            = (data.get("name")           or "").strip()
        email           = (data.get("email")          or "").strip()
        contact_number  = (data.get("contact_number") or "").strip()
        id_number       = (data.get("id_number")      or "").strip()
        role_name       = (data.get("role")           or "").strip()
        department_name = (data.get("department")     or "").strip()

        if not all([name, email, contact_number, id_number, role_name, department_name]):
            return {"error": "All fields are required"}, 400

        existing = AccountRequest.query.filter_by(email=email).filter(
            AccountRequest.status == AccountRequestStatus.PENDING.value
        ).first()
        if existing:
            return {"message": "A request with this email is already pending."}, 409

        role = Role.query.filter(Role.name.ilike(role_name), Role.account_id == 1).first()
        if not role:
            return {"error": f"Role '{role_name}' not found."}, 404

        department = Department.query.filter(
            Department.name.ilike(department_name), Department.account_id == 1
        ).first()
        if not department:
            return {"error": f"Department '{department_name}' not found."}, 404

        new_req = AccountRequest(
            account_id=1,
            name=name,
            email=email,
            contact_number=contact_number,
            id_number=id_number,
            role_id=role.id,
            department_id=department.id,
            status=AccountRequestStatus.PENDING.value,
        )
        db.session.add(new_req)
        db.session.commit()

        return {"message": "Request submitted successfully."}, 201


# ---------------------------------------------------------------------------
# Registration function — called by app/__init__.py
# ---------------------------------------------------------------------------
def technician_routes(api: Api):
    api.add_resource(
        TechnicianDashboardService,
        "/api/technician/dashboard",
        endpoint="TechnicianDashboard",
    )
    api.add_resource(
        TechnicianTicketService,
        "/api/technician/tickets",
        "/api/technician/tickets/<ticket_id>",
        endpoint="TechnicianTicketService",
    )
    api.add_resource(
        TechnicianWorklogService,
        "/api/technician/tickets/<ticket_id>/worklogs",
        endpoint="TechnicianWorklog",
    )
    api.add_resource(
        TechnicianTaskService,
        "/api/technician/tickets/<ticket_id>/tasks",
        endpoint="TechnicianTasks",
    )
    api.add_resource(
        TechnicianChecklistService,
        "/api/technician/tickets/<ticket_id>/checklist",
        endpoint="TechnicianChecklist",
    )
    api.add_resource(
        TechnicianNotificationService,
        "/api/technician/notifications",
        endpoint="TechnicianNotifications",
    )
    api.add_resource(
        TechnicianNotificationReadService,
        "/api/technician/notifications/<int:notif_id>/read",
        endpoint="TechnicianNotificationRead",
    )
    api.add_resource(
        TechnicianStatsService,
        "/api/technician/stats",
        endpoint="TechnicianStats",
    )
    api.add_resource(
        TechnicianAccountRequestService,
        "/api/technician/account-request",
        endpoint="TechnicianAccountRequest",
    )