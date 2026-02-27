from datetime import datetime, timedelta, timezone
from flask import request
from flask_restful import Resource
import secrets

from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    verify_jwt_in_request,
    get_jwt_identity,
    get_jwt,
    decode_token,
)

from app.models.user_model import User, OtpRequest 
from app import bcrypt, db
from app.utils import utcnow, as_utc
from app.utils import is_not_logged_in

# Email login and generates access and refresh token
class EmailLogin(Resource):
    method_decorators=[is_not_logged_in]
    
    def post(self):
        data = request.get_json()
        
        if not data:
            return {"message": "Invalid JSON payload", "success": False}, 400

        email = data.get("email")
        password = data.get("password")
        account_id = data.get("account_id") or data.get("accountId")

        # Verify credentials
        if not email or not password:
            return {"message": "Email and password are required"}, 400

        query = User.query.filter_by(email=email)
        if account_id:
            query = query.filter_by(account_id=account_id)
        user = query.first()

        if not user or not bcrypt.check_password_hash(user.password, password):
            return {"message": "Invalid credentials"}, 401
        
        # Creates access token
        token = create_access_token(identity=str(user.id))
        
        # Creates refresh token
        refresh_token = create_refresh_token(
            identity=str(user.id)
        )

        return {
            "message": "Login successful",
            "success": True,
            "user": user.to_dict(),
            "isFirstTimeLoggedIn": not user.is_password_changed,
            "accessToken": token,
            "refreshToken": refresh_token
        }, 200
   
# Requesting for OTP     
class OtpLogin(Resource):
    method_decorators=[is_not_logged_in]
    OTP_EXPIRATION_SECONDS = 300  # 5 minutes
    
    def post(self):
        data = request.get_json()

        if not data:
            return {"message": "Invalid JSON payload", "success": False}, 400

        phone_number = data.get("phone")
        if not phone_number:
            return {"message": "Phone number is required"}, 400

        user = User.query.filter_by(phone=phone_number).first()
        if not user:
            return {"message": "Invalid credentials"}, 401

        # Invalidate previous OTPs
        OtpRequest.query.filter_by(
            phone=phone_number,
            used_at=None,
            account_id=user.account_id
        ).delete()

        # Generate OTP
        otp = f"{secrets.randbelow(1_000_000):06d}"

        expires_at = utcnow() + timedelta(seconds=self.OTP_EXPIRATION_SECONDS)

        otp_request = OtpRequest(
            phone=phone_number,
            otp=otp,
            account_id=user.account_id,
            otp_expires_at=expires_at
        )
        
        print(otp)

        db.session.add(otp_request)
        db.session.commit()

        return {
            "message": "OTP sent successfully",
            "success": True,
        }, 200
    
# Verifying OTP and generates access and refresh token    
class VerifyOtp(Resource):
    method_decorators=[is_not_logged_in]
    def post(self):
        data = request.get_json()
        
        if not data:
            return {"message": "Invalid JSON payload", "success": False}, 400

        phone_number = data.get("phone")
        otp = data.get("otp")

        if not phone_number or not otp:
            return {"message": "Phone and OTP are required"}, 400

        user = User.query.filter_by(phone=phone_number).first()
        if not user:
            return {"message": "Invalid credentials"}, 401

        otp_request = OtpRequest.query.filter_by(
            phone=phone_number,
            used_at=None,
            account_id=user.account_id
        ).order_by(OtpRequest.created_at.desc()).first()

        if not otp_request:
            return {"message": "OTP not found or already used"}, 401

        if as_utc(otp_request.otp_expires_at) < utcnow():
            return {"message": "OTP expired"}, 401

        if otp_request.otp != otp:
            return {"message": "Invalid OTP"}, 401

        # Mark OTP as used
        otp_request.used_at = utcnow()
        db.session.commit()
        
        token = create_access_token( identity=str(user.id) )
        
        refresh_token = create_refresh_token(
            identity=str(user.id)
        )

        return {
            "message": "OTP verified successfully",
            "success": True,
            "user": user.to_dict(),
            "accessToken": token,
            "refreshToken": refresh_token
        }, 200

# Refreshing access token
class RefreshToken(Resource):
    def post(self):
        data = request.get_json(silent=True) or {}
        refresh_token = data.get("refreshToken")

        if refresh_token:
            try:
                decoded = decode_token(refresh_token)
            except Exception:
                return {"message": "Invalid refresh token", "success": False}, 401

            if decoded.get("type") != "refresh":
                return {"message": "Invalid refresh token", "success": False}, 401

            user_id = decoded.get("sub")
            refresh_exp_timestamp = decoded.get("exp")
        else:
            verify_jwt_in_request(refresh=True)
            user_id = get_jwt_identity()
            jwt_data = get_jwt()
            refresh_exp_timestamp = jwt_data.get("exp")

        access_token = create_access_token(
            identity=user_id,
            expires_delta=timedelta(minutes=15)
        )
        
        # Calculate remaining time until the current refresh token expires
        now = datetime.now(timezone.utc).timestamp()
        remaining_seconds = refresh_exp_timestamp - now
        
        if remaining_seconds > 0:
            refresh_token = create_refresh_token(
                identity=user_id,
                expires_delta=timedelta(seconds=remaining_seconds)
            )
        else:
            refresh_token = None
        
        # return access and refresh token
        return {
            "success": True,
            "message": "Successfully updated access token",
            "accessToken": access_token,
            "refreshToken": refresh_token
        }, 200


class Logout(Resource):
    def post(self):
        return {
            "success": True,
            "message": "Logged out"
        }, 200

