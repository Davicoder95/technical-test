import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.base import Base
from app.db.session import engine
from app.models.user import User
from app.models.task import Task
from app.core.security import get_password_hash

# Crear todas las tablas
print("📊 Creando tablas...")
Base.metadata.create_all(bind=engine)
print("✓ Tablas creadas")

# Crear usuario inicial
from sqlalchemy.orm import Session
db = Session(bind=engine)

existing_user = db.query(User).filter(User.email == "admin@example.com").first()

if not existing_user:
    admin_user = User(
        email="admin@example.com",
        hashed_password=get_password_hash("admin123")
    )
    db.add(admin_user)
    db.commit()
    print("✓ Usuario inicial creado: admin@example.com / admin123")
else:
    print("✓ Usuario inicial ya existe")

db.close()
print("✅ Base de datos configurada correctamente")