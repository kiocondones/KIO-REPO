"""add_task_fields

Revision ID: 0002_add_task_fields
Revises: 0001_initial_schema
Create Date: 2026-02-21 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0002_add_task_fields"
down_revision = "0001_initial_schema"
branch_labels = None
depends_on = None


def upgrade():
    # Add new columns to task table
    op.add_column('task', sa.Column('type', sa.String(length=50), nullable=True))
    op.add_column('task', sa.Column('provider', sa.String(length=255), nullable=True))
    op.add_column('task', sa.Column('service', sa.String(length=255), nullable=True))
    op.add_column('task', sa.Column('issue', sa.String(length=255), nullable=True))
    op.add_column('task', sa.Column('status', sa.String(length=50), nullable=True, server_default='pending'))


def downgrade():
    # Remove the columns if rolling back
    op.drop_column('task', 'status')
    op.drop_column('task', 'issue')
    op.drop_column('task', 'service')
    op.drop_column('task', 'provider')
    op.drop_column('task', 'type')
