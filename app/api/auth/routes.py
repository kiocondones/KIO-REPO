from flask_restful import Api
from app.services import EmailLogin, OtpLogin, VerifyOtp, RefreshToken, Logout

def auth_routes(api: Api):
    api.add_resource(EmailLogin, "/api/auth/login")
    api.add_resource(OtpLogin, "/api/auth/send-otp")
    api.add_resource(VerifyOtp, "/api/auth/verify-otp")
    api.add_resource(RefreshToken, "/api/auth/refresh")
    api.add_resource(Logout, "/api/auth/logout")