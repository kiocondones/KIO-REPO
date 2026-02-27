from flask_restful import Api
from app.services.service_configuration_service import (
    ServiceProvidersResource,
    ServiceCategoriesResource,
    ServiceTemplatesResource,
    ServiceTemplateDetailResource,
)


def service_config_routes(api: Api):
    """Register all service configuration routes"""
    
    # Service Providers (Departments)
    api.add_resource(
        ServiceProvidersResource,
        "/api/service-config/providers",
        endpoint="ServiceProviders"
    )
    
    # Service Categories for a Provider
    api.add_resource(
        ServiceCategoriesResource,
        "/api/service-config/providers/<int:provider_id>/categories",
        endpoint="ServiceCategories"
    )
    
    # Service Templates for a Category
    api.add_resource(
        ServiceTemplatesResource,
        "/api/service-config/categories/<int:category_id>/templates",
        endpoint="ServiceTemplates"
    )
    
    # Service Template Details
    api.add_resource(
        ServiceTemplateDetailResource,
        "/api/service-config/templates/<template_id>",
        endpoint="ServiceTemplateDetail"
    )
