from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Verifica la conexión antes de usarla
    echo=settings.DEBUG   # Log de queries SQL 
)

# Crear SessionLocal
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


#Dependecia para obtener la sesion de la base de datos y cerrarla despues de cara request.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()