"""add_service_fee_to_ticket

Revision ID: 0003_add_service_fee_to_ticket
Revises: 0002_add_task_fields
Create Date: 2026-02-21 14:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0003_add_service_fee_to_ticket"
down_revision = "0002_add_task_fields"
branch_labels = None
depends_on = None


def upgrade():
    # Add service_fee column to ticket table
    op.add_column('ticket', sa.Column('service_fee', sa.Numeric(precision=10, scale=2), nullable=False, server_default='0.00'))


def downgrade():
    # Remove the service_fee column if rolling back
    op.drop_column('ticket', 'service_fee')
