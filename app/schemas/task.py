from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, List
from app.models.task import TaskStatus

# Crear esquema base para tareas
class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Título de la tarea")
    description: Optional[str] = Field(None, description="Descripción opcional de la tarea")
    status: TaskStatus = Field(default=TaskStatus.PENDING, description="Estado de la tarea")

# Crear la clase para crear tarea
class TaskCreate(TaskBase):
    pass

# Crear la clase para actualizar tarea 
class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None

# Crear la clase para respuesta de una tarea
class TaskResponse(TaskBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Crear la clase para respuesta paginada de tareas
class PaginatedTasksResponse(BaseModel):
    items: List[TaskResponse]
    total: int
    page: int
    page_size: int
    total_pages: int