"""add_issue_type_to_ticket

Revision ID: 0004_add_issue_type_to_ticket
Revises: 0003_add_service_fee_to_ticket
Create Date: 2026-02-23 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision = "0004_add_issue_type_to_ticket"
down_revision = "0003_add_service_fee_to_ticket"
branch_labels = None
depends_on = None


def upgrade():
    # Check if issue_type column already exists
    conn = op.get_bind()
    inspector = inspect(conn)
    ticket_columns = [col['name'] for col in inspector.get_columns('ticket')]
    
    if 'issue_type' not in ticket_columns:
        # Add issue_type column to ticket table if it doesn't exist
        op.add_column('ticket', sa.Column('issue_type', sa.String(100), nullable=True, comment='Issue type selected by requestor (e.g., Network Issue, Equipment)'))


def downgrade():
    # Check if issue_type column exists before dropping
    conn = op.get_bind()
    inspector = inspect(conn)
    ticket_columns = [col['name'] for col in inspector.get_columns('ticket')]
    
    if 'issue_type' in ticket_columns:
        # Remove the issue_type column if it exists
        op.drop_column('ticket', 'issue_type')

