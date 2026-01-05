"""seed initial user

Revision ID: 94733606a72e
Revises: 7de323a20914
Create Date: 2026-01-03 20:29:53.895254

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '94733606a72e'
down_revision: Union[str, None] = '7de323a20914'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    from passlib.context import CryptContext
    
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed_password = pwd_context.hash("admin123")
    
    conn = op.get_bind()
    
    result = conn.execute(
        sa.text("SELECT id FROM users WHERE email = :email"),
        {"email": "admin@example.com"}
    ).fetchone()
    
    if result is None:
        conn.execute(
            sa.text("""
                INSERT INTO users (email, hashed_password, created_at)
                VALUES (:email, :password, now())
            """),
            {
                "email": "admin@example.com",
                "password": hashed_password
            }
        )
        conn.commit()
        print("✓ Usuario inicial creado: admin@example.com / admin123")
    else:
        print("✓ Usuario inicial ya existe")


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        sa.text("DELETE FROM users WHERE email = :email"),
        {"email": "admin@example.com"}
    )
    conn.commit()
