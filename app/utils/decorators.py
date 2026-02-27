from flask import g
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from functools import wraps

from app.models import User

def load_user(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        g.user = User.query.get(user_id)

        if not g.user:
            return {
                "message": "User not found",
                "success": False
            }, 401

        return f(*args, **kwargs)
    return wrapper

def is_password_changed(f):
    # Ensure the authenticated user has changed the default password;
    @wraps(f)
    def wrapper(*args, **kwargs):
        user = g.user

        if not user.is_password_changed:
            return {
                "message": "The default password must be changed first",
                "success": False
            }, 403

        return f(*args, **kwargs)
    return wrapper

def is_not_logged_in(f):
    # Ensure that not logged in
    @wraps(f)
    def wrapper(*args, **kwargs):
        # Attempt to get JWT, but don't throw an error if it doesn't exist
        verify_jwt_in_request(optional=True, verify_type=False)
        current_user = get_jwt_identity()
        if current_user:
            return {"message": "You are already logged in", "success": False}, 403
        return f(*args, **kwargs)
    return wrapper

def is_account_active(f):
    # Ensure the authenticated user status is active;
    @wraps(f)
    def wrapper(*args, **kwargs):
        user = g.user

        if not user or user.status != "active":
            return {
                "message": "Account is not active",
                "success": False
            }, 403

        return f(*args, **kwargs)
    return wrapper
