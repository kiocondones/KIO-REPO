from flask_restful import Resource
from flask_jwt_extended import jwt_required
from flask import g
from app.models import Department, ServiceCategory, TicketTemplate
from app.utils import load_user, is_account_active
from app import db


class ServiceProvidersResource(Resource):
    """Get all service providers (departments) for the account"""
    method_decorators = [
        is_account_active,
        load_user,
        jwt_required(),
    ]

    def get(self):
        """Get all service providers for the current account"""
        try:
            providers = Department.query.filter_by(
                account_id=g.user.account_id
            ).all()
            
            return {
                "success": True,
                "providers": [
                    {
                        "id": p.id,
                        "name": p.name,
                        "description": p.description
                    }
                    for p in providers
                ]
            }, 200
        except Exception as e:
            return {
                "success": False,
                "message": f"Error fetching service providers: {str(e)}"
            }, 500


class ServiceCategoriesResource(Resource):
    """Get service categories for a specific service provider"""
    method_decorators = [
        is_account_active,
        load_user,
        jwt_required(),
    ]

    def get(self, provider_id):
        """Get categories for a specific service provider"""
        try:
            categories = ServiceCategory.query.filter_by(
                account_id=g.user.account_id,
                department_id=provider_id
            ).all()
            
            return {
                "success": True,
                "categories": [
                    {
                        "id": c.id,
                        "name": c.name,
                        "code": c.code,
                        "total_templates": len(c.templates) if c.templates else 0
                    }
                    for c in categories
                ]
            }, 200
        except Exception as e:
            return {
                "success": False,
                "message": f"Error fetching service categories: {str(e)}"
            }, 500


class ServiceTemplatesResource(Resource):
    """Get service templates for a specific service category"""
    method_decorators = [
        is_account_active,
        load_user,
        jwt_required(),
    ]

    def get(self, category_id):
        """Get templates for a specific service category"""
        try:
            templates = TicketTemplate.query.filter_by(
                account_id=g.user.account_id,
                category_id=category_id
            ).all()
            
            return {
                "success": True,
                "templates": [
                    {
                        "id": t.id,
                        "name": t.service,
                        "description": t.description,
                        "service_code": t.code,
                        "base_rate": float(t.base_rate) if t.base_rate else 0,
                        "sla_min_days": t.min_days,
                        "sla_max_days": t.max_days,
                        "sla_display": f"{t.min_days}-{t.max_days} days",
                        "status": t.status.value
                    }
                    for t in templates
                ]
            }, 200
        except Exception as e:
            return {
                "success": False,
                "message": f"Error fetching service templates: {str(e)}"
            }, 500


class ServiceTemplateDetailResource(Resource):
    """Get detailed information about a specific service template"""
    method_decorators = [
        is_account_active,
        load_user,
        jwt_required(),
    ]

    def get(self, template_id):
        """Get full details of a service template"""
        try:
            template = TicketTemplate.query.filter_by(
                id=template_id,
                account_id=g.user.account_id
            ).first()
            
            if not template:
                return {
                    "success": False,
                    "message": "Template not found"
                }, 404
            
            return {
                "success": True,
                "template": {
                    "id": template.id,
                    "name": template.service,
                    "description": template.description,
                    "service_code": template.code,
                    "base_rate": float(template.base_rate) if template.base_rate else 0,
                    "sla_min_days": template.min_days,
                    "sla_max_days": template.max_days,
                    "sla_display": f"{template.min_days}-{template.max_days} days",
                    "category_id": template.category_id,
                    "category_name": template.category.name if template.category else None,
                    "status": template.status.value,
                    "estimated_hours": template.estimated_hours,
                    "template_type": template.template_type if hasattr(template, 'template_type') else None
                }
            }, 200
        except Exception as e:
            return {
                "success": False,
                "message": f"Error fetching template details: {str(e)}"
            }, 500
