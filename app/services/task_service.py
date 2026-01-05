from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from math import ceil
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, PaginatedTasksResponse

#servicio para tareas
class TaskService:
    
    @staticmethod
    def create_task(db: Session, task_data: TaskCreate) -> Task:
        #Crea una nueva tarea.
        task = Task(**task_data.model_dump())
        db.add(task)
        db.commit()
        db.refresh(task)
        return task
    
    @staticmethod
    def get_task(db: Session, task_id: int) -> Task:
        #Obtiene una tarea por ID
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Tarea con ID: {task_id} no fue encontrada"
            )
        return task
    
    @staticmethod
    def get_tasks(
        db: Session,
        page: int = 1,
        page_size: int = 10
    ) -> PaginatedTasksResponse:
        #Obtiene tareas con paginación.
        # Validar parámetros
        if page < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El número de página debe ser mayor o igual a 1"
            )
        
        if page_size < 1 or page_size > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El tamaño de página debe estar entre 1 y 100"
            )
        
        # Contar total de tareas
        total = db.query(Task).count()
        
        # Calcular offset
        offset = (page - 1) * page_size
        
        # Obtener tareas ordenadas por fecha de creación (más recientes primero)
        tasks = db.query(Task)\
            .order_by(Task.created_at.desc())\
            .offset(offset)\
            .limit(page_size)\
            .all()
        
        # Calcular total de páginas
        total_pages = ceil(total / page_size) if total > 0 else 0
        
        return PaginatedTasksResponse(
            items=[TaskResponse.model_validate(task) for task in tasks],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    
    @staticmethod
    def update_task(db: Session, task_id: int, task_data: TaskUpdate) -> Task:
        """Actualiza una tarea existente."""
        task = TaskService.get_task(db, task_id)
        
        # Actualizar solo los campos proporcionados
        update_data = task_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(task, field, value)
        
        db.commit()
        db.refresh(task)
        return task
    
    @staticmethod
    def delete_task(db: Session, task_id: int) -> None:
        #Elimina una tarea.
        task = TaskService.get_task(db, task_id)
        db.delete(task)
        db.commit()