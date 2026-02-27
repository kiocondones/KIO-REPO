from flask_restful import Api
from app.services import TicketService, ServiceManagementRequests
from app.services import ReminderRequests, TaskService, CheckListService, WorkLogService, ServiceManagementWorkLogReply, WorkLogCommentService
from app.services import UserManagement, MessageService, FeedbackService, UserService, ResolutionService
from app.services import DepartmentService, SLAPolicyService, TicketTemplateService, ForApprovalService, SLAMonitorService
from app.services import TicketAssignmentService, ServiceConfig, Category

def servicedesk_routes(api: Api):    
    api.add_resource(
        TicketService,
        "/api/servicedesk/tickets",
        "/api/servicedesk/tickets/<string:ticket_id>",
        "/api/servicedesk/tickets/<string:ticket_id>/assign/<int:technician_id>",
        endpoint="ticketServiceDesk"
    )
    
    api.add_resource(
        ServiceConfig,
        "/api/servicedesk/service-configurations",
        endpoint="ServiceConfigDesk"
    )
    
    api.add_resource(
        Category,
        "/api/servicedesk/service-configurations/categories",
    )
    
    api.add_resource(
        TicketTemplateService,
        "/api/servicedesk/service-configurations/templates",
        "/api/servicedesk/service-configurations/templates/<template_id>"
    )

    api.add_resource(
        ServiceManagementRequests,
        "/api/servicedesk/service-management/requests",
        "/api/servicedesk/service-management/requests/<string:ticket_id>"
    )
    
    api.add_resource(
        TaskService,
        "/api/servicedesk/service-management/<string:ticket_id>/tasks",
        "/api/servicedesk/service-management/<string:ticket_id>/tasks/<int:task_id>",
        "/api/tickets/<string:ticket_id>/tasks/<int:task_id>",
        "/api/tickets/<string:ticket_id>/tasks"
    )
    
    api.add_resource(
        ResolutionService,
        "/api/servicedesk/service-management/<string:ticket_id>/resolution",
        "/api/servicedesk/service-management/<string:ticket_id>/resolution/<int:resolution_id>"
    )
    
    api.add_resource(
        CheckListService,
        "/api/servicedesk/service-management/<string:ticket_id>/checklist",
        "/api/servicedesk/service-management/<string:ticket_id>/checklist/<int:checklist_id>",
        "/api/tickets/<string:ticket_id>/checklist",
        "/api/tickets/<string:ticket_id>/checklist/<int:checklist_id>"
    )
    
    api.add_resource(
        WorkLogService,
        "/api/servicedesk/service-management/<string:ticket_id>/worklog",
        "/api/tickets/<string:ticket_id>/worklogs/<int:worklog_id>"
    )

    api.add_resource(
        WorkLogCommentService,
        "/api/tickets/<string:ticket_id>/worklogs/<int:worklog_id>/comments"
    )
    
    api.add_resource(
        ServiceManagementWorkLogReply,
        "/api/servicedesk/service-management/<string:ticket_id>/reply/<int:worklog_id>",
        "/api/servicedesk/service-management/<string:ticket_id>/reply/<int:worklog_id>/<int:reply_id>"
    )
    
    api.add_resource(
        UserManagement,
        "/api/servicedesk/user-management",
        "/api/servicedesk/user-management/<int:user_id>"
    )
    
    api.add_resource(
        ReminderRequests,
        "/api/servicedesk/reminders",
        "/api/servicedesk/reminders/<int:reminder_id>",
    )
    
    api.add_resource(
        MessageService,
        "/api/servicedesk/message"
    )
    
    api.add_resource(
        FeedbackService,
        "/api/servicedesk/feedback/<view_all>"
    )
    
    api.add_resource(
        UserService,
        "/api/servicedesk/viewers",
        endpoint="UserServicedesktop"
    )
    
    api.add_resource(
        ForApprovalService,
        "/api/servicedesk/service-level-controls/pendings",
        "/api/servicedesk/service-level-controls/pendings/<ticket_id>"
    )
    
    api.add_resource(
        DepartmentService,
        "/api/servicedesk/departments",
        "/api/servicedesk/departments/<int:department_id>"
    )
    
    api.add_resource(
        SLAPolicyService,
        "/api/servicedesk/policies",
        "/api/servicedesk/policies/<int:policy_id>"
    )
    
    api.add_resource(
        SLAMonitorService,
        "/api/servicedesk/sla-monitor"
    )
    
    api.add_resource(
        TicketAssignmentService,
        "/api/servicedesk/assignment"
    )
    
    