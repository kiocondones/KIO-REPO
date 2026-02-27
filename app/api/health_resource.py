from flask_restful import Resource
from sqlalchemy import text
from app import db

class HealthResource(Resource):
    def get(self):
        try:
            db.session.execute(text("SELECT 1"))
            return {
                "status": "ok",
                "database": "connected"
            }, 200
        except Exception as e:
            return {
                "status": "error",
                "database": "disconnected",
                "message": str(e)
            }, 500
