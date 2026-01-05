from sqlalchemy import Column, Integer, String, Text, DateTime, Enum
from sqlalchemy.sql import func
import enum
from app.db.base import Base


#Estados de la tarea
class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in progress"
    DONE = "complete"


class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(
        Enum(TaskStatus, name="task_status", create_type=True),
        nullable=False,
        default=TaskStatus.PENDING,
        index=True  # Índice para filtrado rápido por estado
    )
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True  # Índice para ordenamiento por fecha
    )
    # Actualiza automáticamente la fecha de actualización
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    
    def __repr__(self):
        return f"<Task(id={self.id}, title='{self.title}', status='{self.status}')>"