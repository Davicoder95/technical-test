# 📋 Task Management API - Prueba Técnica Backend

API REST para gestión de tareas con autenticación JWT, desarrollada con FastAPI, SQLAlchemy y PostgreSQL.


## 📖 Descripción

Sistema de gestión de tareas que permite realizar operaciones CRUD completas con autenticación segura mediante JWT. El proyecto incluye:

- ✅ Autenticación con JWT y hash de contraseñas
- ✅ CRUD completo de tareas
- ✅ Paginación en el listado de tareas
- ✅ Migraciones automáticas de base de datos
- ✅ Usuario inicial creado automáticamente
- ✅ Frontend web funcional incluido
- ✅ Documentación interactiva con Swagger

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Python | 3.11.8 | Lenguaje de programación |
| FastAPI | 0.109.0 | Framework web moderno y rápido |
| SQLAlchemy | 2.0.25 | ORM para interacción con BD |
| Alembic | 1.13.1 | Sistema de migraciones |
| PostgreSQL | 15 | Base de datos relacional |
| Pydantic | 2.5.3 | Validación de datos |
| python-jose | 3.3.0 | Manejo de JWT |
| passlib[bcrypt] | 1.7.4 | Hash seguro de contraseñas |
| Docker Compose | 3.8 | Orquestación de contenedores |

---

## 🏗️ Arquitectura del Proyecto

```
technical-test-fastapi/
├── app/
│   ├── __init__.py
│   ├── main.py                    # Punto de entrada de la aplicación
│   │
│   ├── api/                       # Endpoints de la API
│   │   ├── __init__.py
│   │   ├── auth.py                # POST /auth/login
│   │   └── tasks.py               # CRUD /tasks
│   │
│   ├── core/                      # Configuración central
│   │   ├── __init__.py
│   │   ├── config.py              # Variables de entorno
│   │   ├── security.py            # JWT y bcrypt
│   │   └── dependencies.py        # Validación de usuarios
│   │
│   ├── db/                        # Base de datos
│   │   ├── __init__.py
│   │   ├── base.py                # Base declarativa
│   │   └── session.py             # Sesiones de BD
│   │
│   ├── models/                    # Modelos SQLAlchemy
│   │   ├── __init__.py
│   │   ├── user.py                # Modelo User
│   │   └── task.py                # Modelo Task
│   │
│   ├── schemas/                   # Schemas Pydantic
│   │   ├── __init__.py
│   │   ├── auth.py                # LoginRequest, TokenResponse
│   │   └── task.py                # TaskCreate, TaskUpdate, etc.
│   │
│   └── services/                  # Lógica de negocio
│       ├── __init__.py
│       ├── auth_service.py        # Autenticación
│       └── task_service.py        # Lógica de tareas
│
├── alembic/                       # Migraciones
│   ├── versions/
│   │   ├── 001_initial_tables.py
│   │   └── 002_seed_initial_user.py
│   └── env.py
│
├── frontend/                      # Frontend web (opcional)
│   └── index.html
│
├── .env                           # Variables de entorno
├── .gitignore
├── alembic.ini                    # Configuración de Alembic
├── create_tables.py               # Script para crear BD
├── docker-compose.yml             # PostgreSQL en Docker
├── requirements.txt               # Dependencias Python
└── README.md
```


## 🚀 Instalación y Configuración

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/technical-test.git
cd technical-test-fastapi
```
### Paso 2: Crear Entorno Virtual

```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate

# En Linux/Mac:
source venv/bin/activate
```

Deberías ver `(venv)` al inicio de tu terminal.

### Paso 3: Instalar Dependencias

```bash
# Actualizar pip
python -m pip install --upgrade pip

# Instalar dependencias del proyecto
pip install -r requirements.txt
```

**Dependencias principales que se instalarán:**
- fastapi, uvicorn (servidor ASGI)
- sqlalchemy, alembic (base de datos)
- psycopg2-binary (driver PostgreSQL)
- python-jose, passlib (seguridad)
- pydantic, pydantic-settings (validación)

### Paso 4: Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

Abre `.env` y agrega el siguiente contenido:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=technical_test
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Configuration
SECRET_KEY=09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application
DEBUG=True
```


### Paso 5: Levantar PostgreSQL con Docker

```bash
# Iniciar PostgreSQL en segundo plano
docker-compose up -d

# Verificar que el contenedor está corriendo
docker ps
```
### Paso 6: Crear Tablas y Usuario Inicial

Ejecuta el script que crea las tablas y el usuario inicial:

```bash
python create_tables.py
```


## ▶️ Ejecutar la Aplicación

### Iniciar el Servidor

```bash
uvicorn app.main:app --reload
```

### Verificar que Funciona

Abre tu navegador en:

- **API Root**: http://localhost:8000/
- **Documentación Swagger**: http://localhost:8000/docs
- **Frontend**: Abre `frontend/index.html` en tu navegador


## 🎯 Decisiones Técnicas

### 1. Identificación por Email vs Username

**Decisión:** Email como identificador único.

**Razones:**
- Más intuitivo para usuarios finales
- No requiere recordar un username adicional
- Facilita recuperación de contraseña en caso de agregar esta funcion

**Formato del Payload de Login:**
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

### 2. Hash de Contraseñas con Bcrypt

**Decisión:** Usar bcrypt a través de passlib.

**Razones:**
- Algoritmo diseñado específicamente para contraseñas
- Resistente a ataques 
- Ampliamente probado y confiable


### 3. Paginación

**Implementación:**
- Parámetros: `page` (número de página, inicia en 1) y `page_size` (items por página)
- Límite máximo: 100 items por página
- Respuesta incluye metadata: `total`, `page`, `page_size`, `total_pages`

**Razones:**
- Mejora tiempo de respuesta
- Facilita navegación en frontend

### 4. Estados de Tareas

**Enum definido:**
```python
class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    DONE = "done"
```

**Razones:**
- Validación a nivel de BD y aplicación
- Previene valores inválidos
- Fácil de extender (ej: agregar "cancelled", "archived")

### 5. Arquitectura por Capas

**Beneficios:**
- **Testeable**: Cada capa se puede probar independientemente
- **Mantenible**: Cambios aislados (ej: cambiar BD no afecta la API)
- **Escalable**: Fácil agregar nuevas funcionalidades
- **Legible**: Separación clara de responsabilidades


### 6. Sin Relación User-Task

**Decisión:** Las tareas no tienen `user_id` (todas son públicas).

**Razones:**
- Simplifica el alcance de la prueba técnica
- Foco en arquitectura y buenas prácticas
- En producción se agregaría `user_id` en `tasks` con relación FK

**Trade-off:**
- ✅ Más simple de implementar
- ❌ Todos los usuarios ven todas las tareas
- 🔧 Fácil de extender agregando FK en futuras versiones

---

## 🎨 Frontend Incluido

Se incluye un frontend web funcional en `frontend/index.html`.

### Características

- ✅ Login con credenciales
- ✅ CRUD completo en modales independientes
- ✅ Búsqueda por ID
- ✅ Paginación
- ✅ Diseño responsive
- ✅ Colores neutros y profesionales

### Uso

1. **Abrir el archivo:**
   ```bash
   # Desde la raíz del proyecto
   cd frontend
   start index.html # O abrir directamente en el navegador
   ```

2. **Login:**
   - Email: `admin@example.com`
   - Password: `admin123`

3. **Crea tu tarea**
---

### Posibles Errores:

### Error: "Connection refused" al conectar a PostgreSQL

**Solución:**
```bash
# Verificar que Docker está corriendo
docker ps

# Si no aparece el contenedor, iniciarlo:
docker-compose up -d

# Ver logs para detectar errores:
docker-compose logs postgres
```

### Error: "bcrypt version" al crear usuario

**Solución:**
```bash
pip uninstall bcrypt
pip install bcrypt==4.0.1
```

### Error: "Token expired"

**Solución:** El token JWT expira cada 30 minutos. Haz login nuevamente para obtener uno nuevo.


## 👤 Autor
DAVISON GABRIEL RODRIGUEZ MONTOYA 
