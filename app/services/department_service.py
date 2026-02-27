from flask import g, request
from flask_restful import Resource
from flask_jwt_extended import jwt_required

from app.models import Department
from app import db
from app.utils import load_user, is_password_changed, is_account_active

class DepartmentService(Resource):
    method_decorators = [
        is_account_active,
        # is_password_changed,
        load_user,
        jwt_required(),
    ]
    
    def get(self):
        departments = Department.query.filter_by(account_id=g.user.account_id).all()
        
        return {
            "message": "Successful",
            "success": True,
            "departments": [d.to_dict() for d in departments]
        }, 200
        
    def post(self):
        data = request.get_json()
        name = data.get("name")
        
        if not name:
            return {
                "message": "Department name is required",
                "success": False,
            }, 400
            
        if Department.query.filter_by(name=name.lower(), account_id=g.user.account_id).first():
            return {
                "message": "Department already is already exists",
                "success": False
            }, 409
            
        try:
            department = Department(name=name, account_id=g.user.account_id)
        
            db.session.add(department)
            db.session.commit()
            
            return {
                "message": "Successfully created department",
                "sucess": True,
            }, 201
            
        except Exception as e:
            db.session.rollback()
            return {
                "message": f"Failed to create department: {str(e)}",
                "success": False
            }, 500
            
    def put(self, department_id=None):
        data = request.get_json()
        
        department_input = data.get("name")
        
        # Checks if department exists
        department = Department.query.get(department_id)
        
        if not department:
            return {
                "message": "Department not found",
                "success": False
            }, 400
        if department.account_id != g.user.account_id:
            return {"message": "Unauthorized", "success": False}, 403
            
        if not department_input:
            return {
                "message": "Department name is required",
                "success": False
            }, 400
        
        if department.name != department_input:
            department.name = department_input
            
        try:
            db.session.commit()
        
            return {
                "message": "Department updated successfully",
                "success": True,
                "department": department.to_dict()
            }, 200
        except Exception as e:
            db.session.rollback()
            return {
                "message": f"Failed to update department: {str(e)}",
                "success": False
            }, 500
        
    def delete(self, department_id=None):
        # Checks if department exists
        department = Department.query.get(department_id)
        
        if not department:
            return {
                "message": "Department not found",
                "success": False
            }, 400
        if department.account_id != g.user.account_id:
            return {"message": "Unauthorized", "success": False}, 403
            
        try:
            db.session.delete(department)
            db.session.commit()
            return {
                "message": "Department deleted successfully",
                "success": True
            }, 200
        except Exception as e:
            db.session.rollback()
            return {
                "message": f"Failed to delete department: {str(e)}",
                "success": False
            }, 500