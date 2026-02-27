from flask import g, request
from flask_restful import Resource
from sqlalchemy import func
from flask_jwt_extended import jwt_required

from app.models import ServiceCategory, Department
from app import db
from app.utils import load_user, is_password_changed, is_account_active

class Category(Resource):
    method_decorators = [
        is_account_active,
        # is_password_changed,
        load_user,
        jwt_required(),
    ]
    
    def post(self):
        """Create a new service category"""
        try:
            data = request.get_json()
            
            # Validations
            if not data:
                return
            
            # category details
            name = data.get("name", "").strip()
            code = data.get("code", "").strip().upper()
            department_id = data.get("department_id", "")
            
            if not name:
                return {
                    "message": "Name is required",
                    "success": False
                }, 400
            
            if not code:
                return {
                    "message": "Code is required",
                    "success": False
                }, 400
            
             # Check if name or code already exist
            if ServiceCategory.query.filter(
                func.upper(ServiceCategory.name) == name.upper(),
                ServiceCategory.account_id == g.user.account_id
            ).first():
                return {"message": f"Service category with name '{name}' already exists", "success": False}, 400
            
            if ServiceCategory.query.filter(
                func.upper(ServiceCategory.code) == code.upper(),
                ServiceCategory.account_id == g.user.account_id
            ).first():
                return {"message": f"Service category with code '{code}' already exists", "success": False}, 400
                
            department = Department.query.get(department_id)
                
            if not department:
                return {
                    "message": "Department not found",
                    "success": False
                }, 400
            if department.account_id != g.user.account_id:
                return {"message": "Unauthorized", "success": False}, 403
            
            # Create new service category
            service_category = ServiceCategory(
                name=name,
                code=code,
                department=department,
                account_id=g.user.account_id,
            )
            
            db.session.add(service_category)
            db.session.commit()
            
            return {
                "message": "Service category created successfully",
                "success": True,
                "category": service_category.to_dict()
            }, 201
            
        except Exception as e:
            db.session.rollback()
            return {
                "message": f"Error creating service category: {str(e)}",
                "success": False
            }, 500