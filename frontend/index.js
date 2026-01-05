const API_URL = 'http://localhost:8000';
let token = localStorage.getItem('token');
let userEmail = localStorage.getItem('userEmail');
let currentPage = 1;
let totalPages = 1;

if (token) showApp();

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    const modal = document.getElementById(modalId);
    const forms = modal.querySelectorAll('form');
    forms.forEach(form => form.reset());
    
    const alerts = modal.querySelectorAll('.alert');
    alerts.forEach(alert => alert.remove());
    
    if (modalId === 'editModal') {
        document.getElementById('editSearch').classList.remove('hidden');
        document.getElementById('editForm').classList.add('hidden');
    }
    
    if (modalId === 'searchModal') {
        document.getElementById('searchResult').classList.add('hidden');
    }
}

document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.id);
        }
    });
});

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Iniciando sesión...';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            token = data.access_token;
            userEmail = email;
            localStorage.setItem('token', token);
            localStorage.setItem('userEmail', email);
            showAlert('loginAlert', '✅ Inicio de sesión exitoso', 'success');
            setTimeout(showApp, 1000);
        } else {
            showAlert('loginAlert', '❌ ' + (data.detail || 'Error al iniciar sesión'), 'error');
        }
    } catch (error) {
        showAlert('loginAlert', '❌ Error de conexión', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Iniciar Sesión';
    }
});

function showApp() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('appSection').classList.add('active');
    document.getElementById('userEmail').textContent = userEmail;
    loadTasks();
}

function logout() {
    localStorage.clear();
    location.reload();
}

// Create Task
document.getElementById('createForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Creando...';

    const taskData = {
        title: document.getElementById('createTitle').value,
        description: document.getElementById('createDescription').value,
        status: document.getElementById('createStatus').value
    };

    try {
        const response = await fetch(`${API_URL}/tasks/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(taskData)
        });

        if (response.ok) {
            showAlert('createAlert', '✅ Tarea creada exitosamente', 'success');
            document.getElementById('createForm').reset();
            loadTasks();
            setTimeout(() => closeModal('createModal'), 2000);
        } else {
            const data = await response.json();
            showAlert('createAlert', '❌ ' + (data.detail || 'Error'), 'error');
        }
    } catch (error) {
        showAlert('createAlert', '❌ Error de conexión', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Crear Tarea';
    }
});

// Search Task
document.getElementById('searchForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('searchId').value;
    const result = document.getElementById('searchResult');
    result.innerHTML = '<div class="loading">🔍 Buscando...</div>';
    result.classList.remove('hidden');

    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const task = await response.json();
            result.innerHTML = `
                <div class="search-result">
                    <div class="task-id">ID: ${task.id}</div>
                    <div class="task-title">${task.title}</div>
                    ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                    <div style="margin: 15px 0;">
                        <span class="status-badge status-${normalizeStatus(task.status)}">${getStatusText(task.status)}</span>
                    </div>
                    <div style="font-size: 13px; color: var(--gray);">
                        Creada: ${new Date(task.created_at).toLocaleDateString('es-ES')}
                    </div>
                </div>
            `;
        } else {
            showAlert('searchAlert', '❌ Tarea no encontrada', 'error');
            result.classList.add('hidden');
        }
    } catch (error) {
        showAlert('searchAlert', '❌ Error de conexión', 'error');
        result.classList.add('hidden');
    }
});

// Edit Task - Search
document.getElementById('editSearchForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editSearchId').value;

    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const task = await response.json();
            document.getElementById('editId').value = task.id;
            document.getElementById('editTitle').value = task.title;
            document.getElementById('editDescription').value = task.description || '';
            document.getElementById('editStatus').value = task.status;
            
            document.getElementById('editSearch').classList.add('hidden');
            document.getElementById('editForm').classList.remove('hidden');
            showAlert('editAlert', '✅ Tarea cargada, puedes editarla ahora', 'success');
        } else {
            showAlert('editAlert', '❌ Tarea no encontrada', 'error');
        }
    } catch (error) {
        showAlert('editAlert', '❌ Error de conexión', 'error');
    }
});

// Edit Task - Submit
document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    const taskData = {
        title: document.getElementById('editTitle').value,
        description: document.getElementById('editDescription').value,
        status: document.getElementById('editStatus').value
    };

    console.log('Enviando datos:', taskData); // Debug

    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(taskData)
        });

        if (response.ok) {
            showAlert('editAlert', '✅ Tarea actualizada exitosamente', 'success');
            loadTasks();
            setTimeout(() => closeModal('editModal'), 2000);
        } else {
            const data = await response.json();
            console.error('Error response:', data); // Debug
            showAlert('editAlert', '❌ ' + (data.detail || 'Error'), 'error');
        }
    } catch (error) {
        console.error('Fetch error:', error); // Debug
        showAlert('editAlert', '❌ Error de conexión', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Guardar Cambios';
    }
});

// Delete Task
document.getElementById('deleteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('deleteId').value;
    
    if (!confirm(`⚠️ ¿Estás seguro de eliminar la tarea #${id}? Esta acción no se puede deshacer.`)) return;

    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Eliminando...';

    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok || response.status === 204) {
            showAlert('deleteAlert', '✅ Tarea eliminada exitosamente', 'success');
            document.getElementById('deleteForm').reset();
            loadTasks();
            setTimeout(() => closeModal('deleteModal'), 2000);
        } else {
            showAlert('deleteAlert', '❌ Error al eliminar', 'error');
        }
    } catch (error) {
        showAlert('deleteAlert', '❌ Error de conexión', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Eliminar Tarea';
    }
});

// Load Tasks
async function loadTasks() {
    const container = document.getElementById('tasksContainer');
    container.innerHTML = '<div class="loading">⏳ Cargando tareas...</div>';

    try {
        const response = await fetch(`${API_URL}/tasks/?page=${currentPage}&page_size=6`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok) {
            totalPages = data.total_pages;
            displayTasks(data.items);
            updatePagination(data);
        } else {
            container.innerHTML = '<div class="alert alert-error">❌ Error al cargar tareas</div>';
        }
    } catch (error) {
        container.innerHTML = '<div class="alert alert-error">❌ Error de conexión</div>';
    }
}

function displayTasks(tasks) {
    const container = document.getElementById('tasksContainer');
    
    if (tasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔭</div>
                <h3 style="color: var(--dark); margin-bottom: 10px;">No hay tareas</h3>
                <p>Crea tu primera tarea usando el botón de arriba</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '<div class="tasks-container">' + tasks.map(task => `
        <div class="task-card">
            <div class="task-header">
                <div>
                    <div class="task-id">ID: ${task.id}</div>
                    <div class="task-title">${task.title}</div>
                </div>
                <span class="status-badge status-${normalizeStatus(task.status)}">${getStatusText(task.status)}</span>
            </div>
            ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            <div class="task-footer">
                <small style="color: var(--gray);">📅 ${new Date(task.created_at).toLocaleDateString('es-ES')}</small>
                <div class="task-actions">
                    <button class="btn-icon btn-edit" onclick="quickEdit(${task.id})">✏️</button>
                    <button class="btn-icon btn-delete" onclick="quickDelete(${task.id})">🗑️</button>
                </div>
            </div>
        </div>
    `).join('') + '</div>';
}

async function quickEdit(id) {
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const task = await response.json();

        document.getElementById('editSearchId').value = id;
        document.getElementById('editId').value = task.id;
        document.getElementById('editTitle').value = task.title;
        document.getElementById('editDescription').value = task.description || '';
        document.getElementById('editStatus').value = task.status;
        
        document.getElementById('editSearch').classList.add('hidden');
        document.getElementById('editForm').classList.remove('hidden');
        
        openModal('editModal');
    } catch (error) {
        alert('❌ Error al cargar tarea');
    }
}

async function quickDelete(id) {
    if (!confirm(`⚠️ ¿Eliminar tarea #${id}?`)) return;
    
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok || response.status === 204) {
            loadTasks();
        } else {
            alert('❌ Error al eliminar');
        }
    } catch (error) {
        alert('❌ Error de conexión');
    }
}

function updatePagination(data) {
    const pagination = document.getElementById('pagination');
    if (data.total_pages <= 1) {
        pagination.classList.add('hidden');
        return;
    }

    pagination.classList.remove('hidden');
    document.getElementById('pageInfo').textContent = 
        `Página ${data.page} de ${data.total_pages} • ${data.total} tareas`;
    document.getElementById('pagination').querySelector('button:first-child').disabled = data.page === 1;
    document.getElementById('pagination').querySelector('button:last-child').disabled = data.page === data.total_pages;
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        loadTasks();
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        loadTasks();
    }
}

// Helper para normalizar status con espacios a guiones bajos para CSS
function normalizeStatus(status) {
    return status.replace(/ /g, '_');
}

function getStatusText(status) {
    const statuses = {
        'pending': 'Pendiente',
        'in progress': 'En Progreso',
        'complete': 'Completada',
        // Fallback para valores viejos
        'in_progress': 'En Progreso',
        'done': 'Completada'
    };
    return statuses[status] || status;
}

function showAlert(elementId, message, type) {
    const container = document.getElementById(elementId);
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    container.innerHTML = '';
    container.appendChild(alert);
    setTimeout(() => alert.remove(), 4000);
}