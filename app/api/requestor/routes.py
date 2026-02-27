from flask_restful import Api
from app.services import (
    RequestorDashboardService,
    RequestorTicketListService,
    RequestorTicketDetailService,
    RequestorTicketRatingService,
    RequestorTicketStatusService,
    RequestorNotificationService,
    RequestorWorklogViewService,
    RequestorTaskViewService,
    RequestorChecklistViewService,
    RequestorLocationsService
)

def requestor_routes(api: Api):
    """Register all requestor-specific routes"""
    
    # Dashboard
    api.add_resource(
        RequestorDashboardService,
        "/api/requestor/dashboard",
        endpoint="RequestorDashboard"
    )
    
    # Tickets
    api.add_resource(
        RequestorTicketListService,
        "/api/requestor/tickets",
        endpoint="RequestorTicketList"
    )
    
    api.add_resource(
        RequestorTicketDetailService,
        "/api/requestor/tickets/<ticket_id>",
        endpoint="RequestorTicketDetail"
    )
    
    # Ticket Rating
    api.add_resource(
        RequestorTicketRatingService,
        "/api/requestor/tickets/<ticket_id>/rating",
        endpoint="RequestorTicketRating"
    )

    # Ticket Status
    api.add_resource(
        RequestorTicketStatusService,
        "/api/requestor/tickets/<ticket_id>/status",
        endpoint="RequestorTicketStatus"
    )
    
    # Notifications
    api.add_resource(
        RequestorNotificationService,
        "/api/requestor/notifications",
        "/api/requestor/notifications/<int:notif_id>",
        endpoint="RequestorNotifications"
    )
    
    # View Worklogs
    api.add_resource(
        RequestorWorklogViewService,
        "/api/requestor/tickets/<ticket_id>/worklogs",
        "/api/requestor/tickets/<ticket_id>/worklogs/<worklog_id>",
        endpoint="RequestorWorklogs"
    )
    
    # View Tasks
    api.add_resource(
        RequestorTaskViewService,
        "/api/requestor/tickets/<ticket_id>/tasks",
        "/api/requestor/tickets/<ticket_id>/tasks/<task_id>",
        endpoint="RequestorTasks"
    )
    
    # View Checklist
    api.add_resource(
        RequestorChecklistViewService,
        "/api/requestor/tickets/<ticket_id>/checklist",
        endpoint="RequestorChecklist"
    )

    api.add_resource(
        RequestorLocationsService,
        "/api/requestor/locations",
        endpoint="RequestorLocations"
    )