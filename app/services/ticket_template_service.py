from flask import g, request
from flask_restful import Resource
from flask_jwt_extended import jwt_required

from app.models import TicketTemplate, TicketType, SLAPolicy, ServiceCategory, TicketTemplateStatus
from app import db
from app.utils import generate_id
from app.utils import load_user, is_password_changed, is_account_active

class TicketTemplateService(Resource):
    method_decorators = [
        is_account_active,
        # is_password_changed,
        load_user,
        jwt_required(),
    ]
    
    def get(self):
        templates = TicketTemplate.query.filter_by(account_id=g.user.account_id).all()
        
        return {
            "message": "Success",
            "success": True,
            "templates": [t.to_dict() for t in templates]
        }, 200

    def post(self):
        data = request.get_json()
        
        # Template Details
        service = data.get("name")
        description = data.get("description")
        base_rate = data.get("baseRate")
        min_days = data.get("minDays")
        max_days = data.get("maxDays")
        ticket_type_str = data.get("type")
        priority_id = data.get("priority", "")
        category_id = data.get("category")
        status = data.get("status")
        code = data.get("code")
        template_type = data.get("templateType")
        
        # Validation
        if not service:
            return {"message": "Service name is required", "success": False}, 400
        if not description:
            return {"message": "Description is required", "success": False}, 400
        if base_rate is None:
            return {"message": "Base rate is required", "success": False}, 400
        if min_days is None:
            return {"message": "Min days is required", "success": False}, 400
        if max_days is None:
            return {"message": "Max days is required", "success": False}, 400
        if not ticket_type_str:
            return {"message": "Ticket type is required", "success": False}, 400
        if not category_id:
            return {"message": "Category is required", "success": False}, 400
        if not status: 
            return {"message": "Status is required", "success": False}, 400
        if not template_type or template_type not in ("JOR", "NONJOR"):
            return {"message": "Invalid template type", "success": False}, 400
        if not code:
            return {"message": "Template code is required", "success": False}, 400 
        if TicketTemplate.query.filter_by(code=code, account_id=g.user.account_id).first():
            return {"message": "Template code is already used", "success": False}, 400
        
        # Relations Validations
        priority = SLAPolicy.query.get(priority_id)
        category = ServiceCategory.query.get(category_id)
        
        if not priority or priority.account_id != g.user.account_id:
            return {"message": "Invalid priority", "success": False}, 400
        
        if not category or category.account_id != g.user.account_id:
            return {"message": "Invalid category", "success": False}, 400

        # Check TicketType Enum
        try:
            ticket_type = TicketType[ticket_type_str.upper()]
        except KeyError:
            return {
                "message": f"Invalid ticket type '{ticket_type_str}'",
                "success": False
            }, 400
            
        # Check Ticket Status Enum
        try:
            status_enum = TicketTemplateStatus[status.upper()]
        except KeyError:
            return {"message": "Invalid status", "success": False}, 400

        # Type conversions
        try:
            base_rate = float(base_rate)
            min_days = int(min_days)
            max_days = int(max_days)
        except ValueError:
            return {"message": "baseRate must be a number, minDays and maxDays must be integers", "success": False}, 400
        
        if base_rate < 1:
            return {"message": "Base rate must be greater than 1", "success": False}, 400
        if min_days < 1:
            return {"message": "The SLA minimum days should be positive numbers", "success": False}, 400
        if min_days > max_days:
            return {
                "message": "minDays cannot be greater than maxDays",
                "success": False
            }, 400

        # Create Template
        template_id = generate_id(template=True)
        
        try:
            template = TicketTemplate(
                id=template_id,
                ticket_type=ticket_type.value,
                service=service,
                category=category,
                description=description,
                base_rate=base_rate,
                min_days=min_days,
                max_days=max_days,
                priority=priority,
                status=status_enum,
                code=code,
                template_type=template_type,
                account_id=g.user.account_id,
            )
            
            db.session.add(template)
            db.session.commit()
            return {"message": "Template successfully created", "success": True}, 201
        except Exception as e:
            db.session.rollback()
            print(str(e))
            return {
                "message": "Failed to create template",
                "error": str(e),
                "success": False
            }, 500

    def put(self, template_id=None):
        data = request.get_json()
        template = TicketTemplate.query.get(template_id)

        if not template:
            return {"message": "Template not found", "success": False}, 404
        if template.account_id != g.user.account_id:
            return {"message": "Unauthorized", "success": False}, 403
        
        if not data:
            return {"message": "Invalid JSON payload", "success": False}, 400

        # Update fields with fallback to existing
        service = data.get("name", template.service)
        description = data.get("description", template.description)
        base_rate = data.get("baseRate", template.base_rate)
        min_days = data.get("minDays", template.min_days)
        max_days = data.get("maxDays", template.max_days)
        ticket_type_str = data.get("type", template.ticket_type)
        priority_id = data.get("priority", template.priority_id)
        category_id = data.get("category", template.category_id)
        status = data.get("status", template.status)
        code = data.get("code", template.code)
        template_type = data.get("templateType", template.template_type)

        # Validation
        if not service:
            return {"message": "Service name is required", "success": False}, 400
        if not description:
            return {"message": "Description is required", "success": False}, 400
        if base_rate is None:
            return {"message": "Base rate is required", "success": False}, 400
        if min_days is None:
            return {"message": "Min days is required", "success": False}, 400
        if max_days is None:
            return {"message": "Max days is required", "success": False}, 400
        if TicketTemplate.query.filter_by(code=code, account_id=g.user.account_id).first() and template.code != code:
            return {"message": "Template code is already used", "success": False}, 400

        # Relations Validations
        priority = SLAPolicy.query.get(priority_id)
        category = ServiceCategory.query.get(category_id)

        if priority_id and (not priority or priority.account_id != g.user.account_id):
            return {"message": "Invalid priority", "success": False}, 400
        if category_id and (not category or category.account_id != g.user.account_id):
            return {"message": "Invalid category", "success": False}, 400

        # Check TicketType Enum
        try:
            ticket_type = TicketType[ticket_type_str.upper()] if ticket_type_str else TicketType[template.ticket_type.upper()]
        except KeyError:
            return {"message": f"Invalid ticket type '{ticket_type_str}'", "success": False}, 400

        # Check Ticket Status Enum
        try:
            status_enum = TicketTemplateStatus[status.upper()] if status else TicketTemplateStatus[template.status.upper()]
        except KeyError:
            return {"message": "Invalid status", "success": False}, 400

        # Type conversions
        try:
            base_rate = float(base_rate)
            min_days = int(min_days)
            max_days = int(max_days)
        except ValueError:
            return {"message": "baseRate must be a number, minDays and maxDays must be integers", "success": False}, 400

        # Constrains
        if base_rate < 1:
            return {"message": "Base rate must be greater than 1", "success": False}, 400
        if min_days < 1:
            return {"message": "The SLA minimum days should be positive numbers", "success": False}, 400
        if min_days > max_days:
            return {"message": "minDays cannot be greater than maxDays", "success": False}, 400
        if template_type not in ("JOR", "NONJOR"):
            return {"message": "Template type is invalid", "success": False}, 400

        # Update template
        template.ticket_type = ticket_type.value
        template.service = service
        template.description = description
        template.base_rate = base_rate
        template.min_days = min_days
        template.max_days = max_days
        template.status = status_enum
        template.code = code
        template.template_type = template_type
        
        if priority:
            template.priority = priority
        if category:
            template.category = category

        try:
            db.session.commit()
            return {"message": "Template successfully updated", "success": True}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"Failed to update template: {str(e)}", "success": False}, 500


    def delete(self, template_id):
        template = TicketTemplate.query.get(template_id)
        if not template:
            return {"message": "Template not found", "success": False}, 404
        if template.account_id != g.user.account_id:
            return {"message": "Unauthorized", "success": False}, 403

        try:
            db.session.delete(template)
            db.session.commit()
            return {"message": "Template successfully deleted", "success": True}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"Failed to delete template: {str(e)}", "success": False}, 500
