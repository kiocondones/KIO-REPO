from flask import g, request
from flask_restful import Resource
from flask_jwt_extended import jwt_required

from app.models import SLAPolicy, TimeUnit
from app import db
from app.utils import load_user, is_password_changed, is_account_active

class SLAPolicyService(Resource):
    method_decorators = [
        is_account_active,
        # is_password_changed,
        load_user,
        jwt_required(),
    ]
    
    # Get all polocies
    def get(self):
        policies = SLAPolicy.query.filter_by(account_id=g.user.account_id).all()
        return {
            "message": "Successful",
            "success": True,
            "policies": [p.to_dict() for p in policies]
        }, 200

    # Create the policy
    def post(self):
        data = request.get_json()

        name = data.get("name")
        response_time = data.get("responseTime")
        response_unit_input = data.get("responseUnit")
        resolution_time = data.get("resolutionTime")
        resolution_unit_input = data.get("resolutionUnit")
        escalation_l1_time = data.get("escalationL1Time")
        escalation_l1_unit_input = data.get("escalationL1Unit")
        escalation_l2_time = data.get("escalationL2Time")
        escalation_l2_unit_input = data.get("escalationL2Unit")

        # Validation
        if not name:
            return {"message": "Name is required", "success": False}, 400
        
        name = name.lower()

        # Duplicate check
        if SLAPolicy.query.filter_by(name=name, account_id=g.user.account_id).first():
            return {
                "message": "SLA Policy with this name already exists",
                "success": False
            }, 409

        # Validate time values
        try:
            response_time = int(response_time)
            resolution_time = int(resolution_time)
            escalation_l1_time = int(escalation_l1_time)
            escalation_l2_time = int(escalation_l2_time)
        except (TypeError, ValueError):
            return {
                "message": "All time values must be integers",
                "success": False
            }, 400

        # Validate enum units
        try:
            response_unit = TimeUnit(response_unit_input)
            resolution_unit = TimeUnit(resolution_unit_input)
            escalation_l1_unit = TimeUnit(escalation_l1_unit_input)
            escalation_l2_unit = TimeUnit(escalation_l2_unit_input)
        except ValueError:
            return {
                "message": "Invalid time unit. Use 'hours' or 'minutes'",
                "success": False
            }, 400

        # Create policy
        try:
            policy = SLAPolicy(
                name=name,
                response_time=response_time,
                response_unit=response_unit,
                resolution_time=resolution_time,
                resolution_unit=resolution_unit,
                escalation_l1=escalation_l1_time,
                escalation_l1_unit=escalation_l1_unit,
                escalation_l2=escalation_l2_time,
                escalation_l2_unit=escalation_l2_unit,
                account_id=g.user.account_id,
            )

            db.session.add(policy)
            db.session.commit()

            return {
                "message": "SLA Policy successfully created",
                "success": True,
                "policy": policy.to_dict()
            }, 201

        except Exception as e:
            db.session.rollback()
            return {
                "message": f"Failed to create SLA Policy: {str(e)}",
                "success": False
            }, 500
        
    # Updates the policy
    def put(self, policy_id=None):
        data = request.get_json()

        policy = SLAPolicy.query.get(policy_id)
        if not policy:
            return {"message": "Policy not found", "success": False}, 404
        if policy.account_id != g.user.account_id:
            return {"message": "Unauthorized", "success": False}, 403

        # Normalize name (safe fallback)
        name = data.get("name", policy.name)
        if name:
            name = name.strip().lower()

        # Duplicate name check (case-insensitive, exclude self)
        existing = SLAPolicy.query.filter_by(name=name, account_id=g.user.account_id).first()

        if existing:
            return {
                "message": "Another SLA Policy with this name already exists",
                "success": False
            }, 409

        # Numeric fields
        response_time = data.get("responseTime", policy.response_time)
        resolution_time = data.get("resolutionTime", policy.resolution_time)
        escalation_l1_time = data.get("escalationL1Time", policy.escalation_l1)
        escalation_l2_time = data.get("escalationL2Time", policy.escalation_l2)

        try:
            response_time = int(response_time)
            resolution_time = int(resolution_time)
            escalation_l1_time = int(escalation_l1_time)
            escalation_l2_time = int(escalation_l2_time)
        except (TypeError, ValueError):
            return {
                "message": "All time values must be integers",
                "success": False
            }, 400

        # Enum fields
        try:
            response_unit = (
                TimeUnit(data["responseUnit"])
                if "responseUnit" in data
                else policy.response_unit
            )
            resolution_unit = (
                TimeUnit(data["resolutionUnit"])
                if "resolutionUnit" in data
                else policy.resolution_unit
            )
            escalation_l1_unit = (
                TimeUnit(data["escalationL1Unit"])
                if "escalationL1Unit" in data
                else policy.escalation_l1_unit
            )
            escalation_l2_unit = (
                TimeUnit(data["escalationL2Unit"])
                if "escalationL2Unit" in data
                else policy.escalation_l2_unit
            )
        except ValueError:
            return {
                "message": "Invalid time unit. Use 'hours' or 'minutes'",
                "success": False
            }, 400

        # Update policy
        try:
            policy.name = name
            policy.response_time = response_time
            policy.response_unit = response_unit
            policy.resolution_time = resolution_time
            policy.resolution_unit = resolution_unit
            policy.escalation_l1 = escalation_l1_time
            policy.escalation_l1_unit = escalation_l1_unit
            policy.escalation_l2 = escalation_l2_time
            policy.escalation_l2_unit = escalation_l2_unit

            db.session.commit()

            return {
                "message": "SLA Policy successfully updated",
                "success": True,
                "policy": policy.to_dict()
            }, 200

        except Exception as e:
            db.session.rollback()
            return {
                "message": f"Failed to update SLA Policy: {str(e)}",
                "success": False
            }, 500
    
    # Deletes the policy
    def delete(self, policy_id):
        policy = SLAPolicy.query.get(policy_id)
        
        if not policy:
            return { "message": "Policy not found", "success": False}, 404
        if policy.account_id != g.user.account_id:
            return {"message": "Unauthorized", "success": False}, 403
        
        # Delete policy
        try:
            db.session.delete(policy)
            db.session.commit()
            
            return {
                "message": "SLA Policy successfully deleted",
                "success": True,
            }, 200
            
        except Exception as e:
            db.session.rollback()
            return {
                "message": f"Failed to delete SLA Policy: {str(e)}",
                "success": False
            }, 500
        