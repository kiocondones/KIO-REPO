from flask import request, g
from flask_restful import Resource
from flask_jwt_extended import jwt_required

from app.utils import load_user, is_password_changed, is_account_active
from app.models import User, Role, Department
from app import db, bcrypt

class UserManagement(Resource):
    method_decorators = [
        is_account_active,
        # is_password_changed,
        load_user,
        jwt_required(),
    ]
    
    def get(self):
        users = User.query.filter_by(account_id=g.user.account_id).all()
        departments = Department.query.filter_by(account_id=g.user.account_id).all()
        roles = Role.query.filter_by(account_id=g.user.account_id).all()

        return {
            "message": "Success",
            "success": True,
            "users": [u.to_dict() for u in users],
            "roles": [r.name for r in roles],
            "departments": [d.name for  d in departments]
            }, 200
        
    def post(self):
        data = request.get_json(silent=True)

        if not data:
            return {"message": "Invalid JSON payload", "success": False}, 400

        name = data.get("name")
        email = data.get("email")
        phone = data.get("phone")
        role = data.get("role")
        
        department_input = data.get("department", "")
        department = Department.query.filter_by(
            name=department_input,
            account_id=g.user.account_id
        ).first()

        # Validate
        if not name:
            return {"message": "Name is required", "success": False}, 400
        if not email:
            return {"message": "Email is required", "success": False}, 400
        if not phone:
            return {"message": "Phone is required", "success": False}, 400
        if not role:
            return {"message": "Role is required", "success": False}, 400
        if role.lower() != "viewer" and not department_input:
            return {"message": "Department is required", "success": False}, 400
        
        role = Role.query.filter_by(name=role, account_id=g.user.account_id).first()
        if not role: 
            return {"message": "Role is not found", "success": False}, 400

        # Check Unique email and password
        if User.query.filter_by(email=email, account_id=g.user.account_id).first():
            return {"message": "Email is already taken", "success": False}, 409

        if User.query.filter_by(phone=phone, account_id=g.user.account_id).first():
            return {"message": "Phone number is already taken", "success": False}, 409
        
        # cleaned_name = name.replace(" ", "")
        # default_pw = f"{cleaned_name.strip()}_{secrets.randbelow(10000):04}"
        default_pw = "password"
        hashed_password = bcrypt.generate_password_hash(default_pw).decode("utf-8")

        # Create User
        try:
            user = User(
                name=name,
                email=email,
                phone=phone,
                password=hashed_password,
                role=role,
                department=department,
                account_id=g.user.account_id,
            )

            db.session.add(user)
            db.session.commit()

            return {
                "message": "User created successfully",
                "success": True,
                "user": user.to_dict(),
                "defaultPassword": default_pw,
                "email": email
            }, 201

        except Exception as e:
            db.session.rollback()
            return {"message": f"Database error: {str(e)}", "success": False}, 500
            
    # Updates user Information
    def put(self, user_id=None):
        data = request.get_json(silent=True)
        if not data:
            return {"message": "Invalid JSON payload", "success": False}, 400

        # Fetch user
        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found", "success": False}, 404
        if user.account_id != g.user.account_id:
            return {"message": "Unauthorized", "success": False}, 403

        # Extract fields or fallback to current values
        name = data.get("name", user.name)
        email = data.get("email", user.email)
        phone = data.get("phone", user.phone)
        role_input = data.get("role", user.role.name)
        department_input = data.get("department", user.department.name if user.department else None)
        status = data.get("status", user.status)

        role = Role.query.filter_by(name=role_input, account_id=g.user.account_id).first()
        if role_input != user.role.name and not role:
            return {"message": "Role is not found", "success": False}, 400

        # Check email uniqueness
        if email != user.email and User.query.filter(
            User.email == email,
            User.id != user.id,
            User.account_id == g.user.account_id
        ).first():
            return {"message": "Email is already taken", "success": False}, 409

        # Check phone uniqueness
        if phone != user.phone and User.query.filter(
            User.phone == phone,
            User.id != user.id,
            User.account_id == g.user.account_id
        ).first():
            return {"message": "Phone is already taken", "success": False}, 409

        # Validate department
        department = None
        if department_input:
            department = Department.query.filter_by(
                name=department_input,
                account_id=g.user.account_id
            ).first()
            if not department:
                return {"message": "Department not found", "success": False}, 400

        # Removes whitespaces
        email = email.replace(" ", "")
        phone = phone.replace(" ", "")
        
        # Update user
        try:
            user.update_user(
                name=name,
                email=email,
                phone=phone,
                department=department,
                role=role,
                status=status
            )
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {"message": "Server error", "success": False}, 500

        return {
            "message": "User updated successfully",
            "success": True,
            "user": user.to_dict()
        }, 200
        
    # Updates the password
    def patch(self, user_id):
        data = request.get_json()
        
        # Validations
        if not data:
            return {"message": "Invalid JSON payload", "success": False}, 400
        
        password = data.get("password")
        
        if not password:
            return {
                "message": "password is required",
                "success": False,
            }, 400
            
        user = User.query.get(user_id)
        
        if not user:
            return {
                "message": "User not found",
                "success": False,
            }, 404
        
        # Updating password
        try:
            new_password = bcrypt.generate_password_hash(password).decode("utf-8")
            
            user.is_password_changed = True
            user.password = new_password
            db.session.commit()
            
            return {
                "message": "Successful changed password",
                "success": True,
            }, 200
        except:
            db.session.rollback()
            return {"message": "Server error", "success": False}, 500

    # Delete User
    def delete(self, user_id):
        user = User.query.get(user_id)
        
        if not user:
            return { "message": "User not found", "success": False }, 404
        if user.account_id != g.user.account_id:
            return {"message": "Unauthorized", "success": False}, 403
        
        try:
            db.session.delete(user)
            db.session.commit()
            
            return {
                "message": "User deleted successfully",
                "success": True,
            }, 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"Database error: {str(e)}", "success": False}, 500
        
class UserService(Resource):
    method_decorators = [
        is_account_active,
        # is_password_changed,
        load_user,
        jwt_required(),
    ]
    
    def get(self):
        viewers = (
            User.query.join(Role)
            .filter(
                Role.name == "Viewer",
                User.account_id == g.user.account_id
            )
            .all()
        )
        
        return {
            "message": "Successful",
            "success": True,
            "users": [u.user_name_phone() for u in viewers]
        }
    
    def patch(self):
        data = request.get_json()

        status = data.get("status")

        # Validation
        if status is None:
            return {"message": "status is required", "success": False}, 400

        if not isinstance(status, bool):
            return {"message": "status must be a boolean", "success": False}, 400

        try:
            user = g.user

            user.is_on_duty = status
            db.session.commit()

            return {
                "message": "Duty status updated successfully",
                "success": True,
                "data": {
                    "user_id": user.id,
                    "is_on_duty": user.is_on_duty
                }
            }, 200

        except Exception as e:
            db.session.rollback()
            return {
                "message": "Failed to update duty status",
                "success": False
            }, 500
                