"""add actor_id column to notification

Revision ID: 97ae7fb9b7d5
Revises: 433115ff202b
Create Date: 2025-07-14 02:46:50.084268

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '97ae7fb9b7d5'
down_revision = '433115ff202b'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('notification', schema=None) as batch_op:
        batch_op.add_column(sa.Column('actor_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            'fk_notification_actor_id_users',  # nome da constraint
            'users',
            ['actor_id'],
            ['id']
        )

def downgrade():
    with op.batch_alter_table('notification', schema=None) as batch_op:
        batch_op.drop_constraint('fk_notification_actor_id_users', type_='foreignkey')
        batch_op.drop_column('actor_id')
    