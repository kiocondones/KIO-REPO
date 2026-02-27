"""initial schema

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-02-20 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "account",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name", name="uq_account_name"),
    )
    op.create_index("ix_account_name", "account", ["name"], unique=True)

    op.create_table(
        "department",
        sa.Column("department_id", sa.Integer(), nullable=False),
        sa.Column("account_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["account_id"], ["account.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("department_id"),
        sa.UniqueConstraint("account_id", "name", name="uq_department_account_name"),
    )
    op.create_index("ix_department_account_id", "department", ["account_id"], unique=False)

    op.create_table(
        "role",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("account_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("department_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["account_id"], ["account.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["department_id"], ["department.department_id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("account_id", "name", name="uq_role_account_name"),
    )
    op.create_index("ix_role_account_id", "role", ["account_id"], unique=False)

    op.create_table(
        "user",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("account_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("location", sa.String(length=150), nullable=True),
        sa.Column("email", sa.String(length=150), nullable=False),
        sa.Column("phone", sa.String(length=11), nullable=False),
        sa.Column("password", sa.Text(), nullable=False),
        sa.Column("is_on_duty", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("status", sa.Enum("active", "inactive", name="user_status_enum"), nullable=False, server_default="active"),
        sa.Column("is_password_changed", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("role_id", sa.Integer(), nullable=True),
        sa.Column("department_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["account_id"], ["account.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["department_id"], ["department.department_id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["role_id"], ["role.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("account_id", "email", name="uq_user_account_email"),
        sa.UniqueConstraint("account_id", "phone", name="uq_user_account_phone"),
    )
    op.create_index("ix_user_account_id", "user", ["account_id"], unique=False)
    op.create_index("ix_user_email", "user", ["email"], unique=False)
    op.create_index("ix_user_phone", "user", ["phone"], unique=False)

    op.create_table(
        "otp_request",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("account_id", sa.Integer(), nullable=True),
        sa.Column("phone", sa.String(length=11), nullable=False),
        sa.Column("otp", sa.String(length=6), nullable=False),
        sa.Column("otp_expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["account_id"], ["account.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_otp_request_account_id", "otp_request", ["account_id"], unique=False)
    op.create_index("ix_otp_request_phone", "otp_request", ["phone"], unique=False)

    op.create_table(
        "sla_policy",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("account_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("response_time", sa.Integer(), nullable=False),
        sa.Column("response_unit", sa.Enum("HOURS", "MINUTES", name="timeunit"), nullable=False, server_default="HOURS"),
        sa.Column("resolution_time", sa.Integer(), nullable=False),
        sa.Column("resolution_unit", sa.Enum("HOURS", "MINUTES", name="timeunit"), nullable=False, server_default="HOURS"),
        sa.Column("escalation_l1", sa.Integer(), nullable=False),
        sa.Column("escalation_l1_unit", sa.Enum("HOURS", "MINUTES", name="timeunit"), nullable=False, server_default="HOURS"),
        sa.Column("escalation_l2", sa.Integer(), nullable=False),
        sa.Column("escalation_l2_unit", sa.Enum("HOURS", "MINUTES", name="timeunit"), nullable=False, server_default="HOURS"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["account_id"], ["account.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("account_id", "name", name="uq_sla_policy_account_name"),
    )
    op.create_index("ix_sla_policy_account_id", "sla_policy", ["account_id"], unique=False)

    op.create_table(
        "service_category",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("account_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("code", sa.String(length=10), nullable=True),
        sa.Column("department_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["account_id"], ["account.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["department_id"], ["department.department_id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("account_id", "name", name="uq_service_category_account_name"),
        sa.UniqueConstraint("account_id", "code", name="uq_service_category_account_code"),
    )
    op.create_index("ix_service_category_account_id", "service_category", ["account_id"], unique=False)

    op.create_table(
        "ticket_template",
        sa.Column("id", sa.String(length=100), nullable=False),
        sa.Column("account_id", sa.Integer(), nullable=False),
        sa.Column("ticket_type", sa.Enum("incident", "service", name="tickettype"), nullable=False),
        sa.Column("service", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("estimated_hours", sa.Integer(), nullable=True),
        sa.Column("template_type", sa.Enum("JOR", "NONJOR", name="templatetype"), nullable=False),
        sa.Column("code", sa.String(length=150), nullable=False),
        sa.Column("category_id", sa.Integer(), nullable=False),
        sa.Column("base_rate", sa.Float(), nullable=True),
        sa.Column("min_days", sa.Integer(), nullable=False),
        sa.Column("max_days", sa.Integer(), nullable=False),
        sa.Column("priority_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.Enum("active", "inactive", name="tickettemplatestatus"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["account_id"], ["account.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["category_id"], ["service_category.id"]),
        sa.ForeignKeyConstraint(["priority_id"], ["sla_policy.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint("base_rate >= 0", name="check_base_rate_positive"),
        sa.CheckConstraint("min_days >= 0", name="check_min_days_positive"),
        sa.CheckConstraint("max_days >= min_days", name="check_days_range"),
        sa.CheckConstraint("(template_type = 'NONJOR' AND (base_rate IS NULL OR base_rate = 0)) OR template_type = 'JOR'", name="check_template_type_base_rate"),
        sa.UniqueConstraint("account_id", "ticket_type", "service", name="uq_ticket_template_account_type_service"),
        sa.UniqueConstraint("account_id", "code", name="uq_ticket_template_account_code"),
    )
    op.create_index("ix_ticket_template_account_id", "ticket_template", ["account_id"], unique=False)
    op.create_index("ix_ticket_template_service", "ticket_template", ["service"], unique=False)

    op.create_table(
        "ticket",
        sa.Column("id", sa.String(length=10), nullable=False),
        sa.Column("account_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("channel", sa.String(length=100), nullable=True),
        sa.Column("location", sa.String(length=100), nullable=True),
        sa.Column("ticket_type", sa.Enum("incident", "service", name="ticket_type"), nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("priority_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.Enum("pending", "open", "investigating", "in_progress", "completed", "closed", "rejected", name="ticket_status"), nullable=False, server_default="open"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("requester_id", sa.Integer(), nullable=False),
        sa.Column("assigned_to_id", sa.Integer(), nullable=True),
        sa.Column("assigned_by_id", sa.Integer(), nullable=True),
        sa.Column("template_id", sa.String(length=100), nullable=True),
        sa.Column("sla_started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("sla_minutes", sa.Integer(), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_assigned", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.ForeignKeyConstraint(["account_id"], ["account.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["assigned_by_id"], ["user.id"]),
        sa.ForeignKeyConstraint(["assigned_to_id"], ["user.id"]),
        sa.ForeignKeyConstraint(["priority_id"], ["sla_policy.id"]),
        sa.ForeignKeyConstraint(["requester_id"], ["user.id"]),
        sa.ForeignKeyConstraint(["template_id"], ["ticket_template.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_ticket_account_id", "ticket", ["account_id"], unique=False)
    op.create_index("ix_ticket_requester_id", "ticket", ["requester_id"], unique=False)
    op.create_index("ix_ticket_assigned_to_id", "ticket", ["assigned_to_id"], unique=False)
    op.create_index("ix_ticket_status", "ticket", ["status"], unique=False)

    op.create_table(
        "task",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("account_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("due_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_completed", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("assigned_to_id", sa.Integer(), nullable=False),
        sa.Column("ticket_id", sa.String(length=10), nullable=False),
        sa.ForeignKeyConstraint(["account_id"], ["account.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["assigned_to_id"], ["user.id"]),
        sa.ForeignKeyConstraint(["ticket_id"], ["ticket.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_task_account_id", "task", ["account_id"], unique=False)
    op.create_index("ix_task_ticket_id", "task", ["ticket_id"], unique=False)

    op.create_table(
        "check_list",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("account_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("title", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("is_completed", sa.Boolean(), nullable=True, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ticket_id", sa.String(length=100), nullable=False),
        sa.ForeignKeyConstraint(["account_id"], ["account.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["ticket_id"], ["ticket.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_check_list_account_id", "check_list", ["account_id"], unique=False)
    op.create_index("ix_check_list_ticket_id", "check_list", ["ticket_id"], unique=False)

    op.create_table(
        "work_log",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("account_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("author_id", sa.Integer(), nullable=False),
        sa.Column("ticket_id", sa.String(length=10), nullable=False),
        sa.ForeignKeyConstraint(["account_id"], ["account.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["author_id"], ["user.id"]),
        sa.ForeignKeyConstraint(["ticket_id"], ["ticket.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_work_log_account_id", "work_log", ["account_id"], unique=False)
    op.create_index("ix_work_log_ticket_id", "work_log", ["ticket_id"], unique=False)

    op.create_table(
        "work_log_message",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("account_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("author_id", sa.Integer(), nullable=False),
        sa.Column("worklog_id", sa.Integer(), nullable=False),
        sa.Column("parent_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["account_id"], ["account.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["author_id"], ["user.id"]),
        sa.ForeignKeyConstraint(["parent_id"], ["work_log_message.id"]),
        sa.ForeignKeyConstraint(["worklog_id"], ["work_log.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_work_log_message_account_id", "work_log_message", ["account_id"], unique=False)
    op.create_index("ix_work_log_message_worklog_id", "work_log_message", ["worklog_id"], unique=False)

    op.create_table(
        "history",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("account_id", sa.Integer(), nullable=False),
        sa.Column("action", sa.Text(), nullable=False),
        sa.Column("details", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ticket_id", sa.String(length=10), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["account_id"], ["account.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["ticket_id"], ["ticket.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_history_account_id", "history", ["account_id"], unique=False)
    op.create_index("ix_history_ticket_id", "history", ["ticket_id"], unique=False)

    op.create_table(
        "resolution",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("account_id", sa.Integer(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("is_draft", sa.Boolean(), nullable=True, server_default=sa.text("0")),
        sa.Column("ticket_id", sa.String(length=100), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["account_id"], ["account.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["ticket_id"], ["ticket.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_resolution_account_id", "resolution", ["account_id"], unique=False)
    op.create_index("ix_resolution_ticket_id", "resolution", ["ticket_id"], unique=False)

    op.create_table(
        "feedback",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("account_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("ticket_id", sa.String(length=10), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("rating >= 1 AND rating <= 5", name="rating_range"),
        sa.ForeignKeyConstraint(["account_id"], ["account.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["ticket_id"], ["ticket.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("ticket_id", name="uq_feedback_ticket_id"),
    )
    op.create_index("ix_feedback_account_id", "feedback", ["account_id"], unique=False)
    op.create_index("ix_feedback_ticket_id", "feedback", ["ticket_id"], unique=False)

    op.create_table(
        "notification",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("account_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.Enum("pending", "success", "failed", name="notificationstatus"), nullable=False, server_default="pending"),
        sa.Column("notification_type", sa.Enum("message", "announcement", "reminder", "notification", name="notificationtype"), nullable=False),
        sa.Column("source_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("target_user_id", sa.Integer(), nullable=True),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["account_id"], ["account.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["target_user_id"], ["user.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_notification_account_id", "notification", ["account_id"], unique=False)
    op.create_index("ix_notification_target_user_id", "notification", ["target_user_id"], unique=False)

    op.create_table(
        "reminder",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("account_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("reminder_type", sa.String(length=100), nullable=False),
        sa.Column("target_type", sa.String(length=100), nullable=False),
        sa.Column("priority", sa.Enum("low", "normal", "high", "urgent", name="reminderpriority"), nullable=False),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("all_day_event", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("repeat_reminder", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("target_user_id", sa.Integer(), nullable=True),
        sa.Column("target_department_id", sa.Integer(), nullable=True),
        sa.Column("target_ticket_id", sa.String(length=100), nullable=True),
        sa.Column("target_task_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["account_id"], ["account.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["target_department_id"], ["department.department_id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["target_task_id"], ["task.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["target_ticket_id"], ["ticket.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["target_user_id"], ["user.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_reminder_account_id", "reminder", ["account_id"], unique=False)

    op.create_table(
        "file",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("account_id", sa.Integer(), nullable=False),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("size", sa.Integer(), nullable=False),
        sa.Column("mimetype", sa.String(length=100), nullable=False),
        sa.Column("location", sa.String(length=500), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ticket_id", sa.String(length=100), nullable=True),
        sa.CheckConstraint("size >= 0", name="check_file_size_non_negative"),
        sa.CheckConstraint("size <= 10485760", name="check_file_size_less_10mb"),
        sa.ForeignKeyConstraint(["account_id"], ["account.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["ticket_id"], ["ticket.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_file_account_id", "file", ["account_id"], unique=False)
    op.create_index("ix_file_ticket_id", "file", ["ticket_id"], unique=False)

    op.create_table(
        "message",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("account_id", sa.Integer(), nullable=False),
        sa.Column("sender_id", sa.Integer(), nullable=False),
        sa.Column("recipient_id", sa.Integer(), nullable=False),
        sa.Column("subject", sa.String(length=100), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("is_draft", sa.Boolean(), nullable=True, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["account_id"], ["account.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["recipient_id"], ["user.id"]),
        sa.ForeignKeyConstraint(["sender_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_message_account_id", "message", ["account_id"], unique=False)

    op.create_table(
        "account_requests",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("account_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=100), nullable=False),
        sa.Column("contact_number", sa.String(length=30), nullable=False),
        sa.Column("id_number", sa.String(length=50), nullable=False),
        sa.Column("role_id", sa.Integer(), nullable=False),
        sa.Column("department_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=True, server_default="Pending"),
        sa.Column("requested_by_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True, server_default=sa.func.current_timestamp()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True, server_default=sa.func.current_timestamp(), onupdate=sa.func.current_timestamp()),
        sa.ForeignKeyConstraint(["account_id"], ["account.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["department_id"], ["department.department_id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["requested_by_id"], ["user.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["role_id"], ["role.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_account_requests_account_id", "account_requests", ["account_id"], unique=False)
    op.create_index("ix_account_requests_status", "account_requests", ["status"], unique=False)
    op.create_index("ix_account_requests_created_at", "account_requests", ["created_at"], unique=False)
    op.create_index("ix_account_requests_email", "account_requests", ["email"], unique=False)


def downgrade():
    op.drop_table("account_requests")
    op.drop_table("message")
    op.drop_table("file")
    op.drop_table("reminder")
    op.drop_table("notification")
    op.drop_table("feedback")
    op.drop_table("resolution")
    op.drop_table("history")
    op.drop_table("work_log_message")
    op.drop_table("work_log")
    op.drop_table("check_list")
    op.drop_table("task")
    op.drop_table("ticket")
    op.drop_table("ticket_template")
    op.drop_table("service_category")
    op.drop_table("sla_policy")
    op.drop_table("otp_request")
    op.drop_table("user")
    op.drop_table("role")
    op.drop_table("department")
    op.drop_table("account")
