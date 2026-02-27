from flask_restful import Resource
from flask_jwt_extended import jwt_required
from app.models import ServiceCategory, TicketTemplate, Department, SLAPolicy
from app.utils import load_user, is_password_changed, is_account_active

from flask import g

class ServiceConfig(Resource):
    method_decorators = [
        is_account_active,
        # is_password_changed,
        load_user,
        jwt_required(),
    ]

    def get(self):
        role = g.user.role.name.lower()

        categories = ServiceCategory.query.filter_by(account_id=g.user.account_id).all()
        templates = TicketTemplate.query.filter_by(account_id=g.user.account_id).all()

        response = {
            "message": "Success",
            "success": True,
            "categories": [c.to_dict() for c in categories],
            "templates": [t.to_dict() for t in templates]
        }

        if role in ("admin", "manager"):
            departments = Department.query.filter_by(account_id=g.user.account_id).all()
            sla_policies = SLAPolicy.query.filter_by(account_id=g.user.account_id).all()
            response.update({
                "departments": [d.to_dict() for d in departments],
                "priorities": [p.to_dict() for p in sla_policies]
            })

        return response, 200