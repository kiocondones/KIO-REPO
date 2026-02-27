"""add_service_configuration_to_ticket

Revision ID: 0005_add_service_configuration_to_ticket
Revises: 0004_add_issue_type_to_ticket
Create Date: 2026-02-25 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0005_add_service_configuration_to_ticket"
down_revision = "0004_add_issue_type_to_ticket"
branch_labels = None
depends_on = None


def upgrade():
    # Add service configuration columns to ticket table
    op.add_column('ticket', sa.Column('service_provider_id', sa.Integer, nullable=True, comment='Service Provider (Department)'))
    op.add_column('ticket', sa.Column('service_category_id', sa.Integer, nullable=True, comment='Service Category'))
    op.add_column('ticket', sa.Column('severity_adjustment', sa.String(50), nullable=True, default='normal', comment='Severity adjustment level (normal, high, critical)'))
    op.add_column('ticket', sa.Column('severity_multiplier', sa.Float, nullable=True, default=1.0, comment='Severity multiplier for service fee calculation'))
    
    # Add foreign key constraints
    op.create_foreign_key('fk_ticket_service_provider_id', 'ticket', 'department', ['service_provider_id'], ['department_id'], ondelete='SET NULL')
    op.create_foreign_key('fk_ticket_service_category_id', 'ticket', 'service_category', ['service_category_id'], ['id'], ondelete='SET NULL')


def downgrade():
    # Remove the foreign key constraints
    op.drop_constraint('fk_ticket_service_provider_id', 'ticket')
    op.drop_constraint('fk_ticket_service_category_id', 'ticket')
    
    # Remove the columns if rolling back
    op.drop_column('ticket', 'service_provider_id')
    op.drop_column('ticket', 'service_category_id')
    op.drop_column('ticket', 'severity_adjustment')
    op.drop_column('ticket', 'severity_multiplier')
