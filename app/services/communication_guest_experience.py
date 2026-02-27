from flask import g, request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity 

from app.models import Message, User, Feedback
from app import db
from app.utils import load_user, is_password_changed, is_account_active

class MessageService(Resource):
    method_decorators = [
        is_account_active,
        # is_password_changed,
        load_user,
        jwt_required(),
    ]
    
    def get(self):
        user_id = get_jwt_identity()
        sender = User.query.get(user_id)
            
        messages = (
            Message.query
            .filter_by(sender_id=sender.id, account_id=sender.account_id)
            .order_by(Message.created_at.asc())
            .all()
        )
            
        return {
            "message": "Successfully",
            "success": True,
            "messages": [m.message_preview() for m in messages],
            "totalMessagesSent": len(messages),
            "averageCSAT": 0,
            "npsScore": 0,
            "recoveryCases": 0
        }, 200
            
        
    def post(self):
        data = request.get_json()
        
        user_id = get_jwt_identity()
        sender = User.query.get(user_id)
            
        recipient_id = data.get("recipient")
        subject = data.get("subject")
        message = data.get("message")
        is_draft = data.get("isDraft", False)
        
        recipient = User.query.get(recipient_id)
        
        if not recipient:
            return {
                "message": "Recipient not found",
                "success": False,
            }, 404
            
        if not subject:
            return {
                "message": "Subject is required",
                "success": False
            }, 400
            
        if not message:
            return {
                "message": "Message is required",
                "success": False
            }, 400
            
        try:
            message = Message(
                subject=subject,
                message=message,
                sender=sender,
                recipient=recipient,
                is_draft=is_draft,
                account_id=sender.account_id,
            )
            
            db.session.add(message)
            db.session.commit()
            
            return {
                "message": "Successfully sent a message",
                "success": True,
                "message": message.to_dict()
            }, 201
            
        except Exception as e:
            db.session.rollback()
            return {
                "message": f"Failed to create reminder: {str(e)}",
                "success": False
            }, 500
            
class FeedbackService(Resource):
    method_decorators = [jwt_required()]
    
    def get(self, view_all: str): 
        account_id = g.user.account_id
        query = Feedback.query.filter_by(account_id=account_id).order_by(Feedback.created_at.asc())
        
        if view_all.lower() != "all":
            query = query.limit(5)
        
        feedbacks = query.all()
        
        return {
            "message": "Successful",
            "success": True,
            "feedbacks": [f.to_dict() for f in feedbacks]
        }