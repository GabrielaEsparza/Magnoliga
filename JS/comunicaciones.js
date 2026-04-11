// --- FUNCIONES PARA AGREGAR ELEMENTOS ---

// 1. Agregar Servicio
document.getElementById('formServicio')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const titulo = this.querySelector('input[placeholder*="Ej: Fotografía"]').value;
    const desc = this.querySelector('textarea').value;
    const icono = this.querySelector('input[placeholder*="fa-"]').value || 'fa-star';

    const nuevoServicio = `
        <div class="col-md-4 position-relative card-admin-item">
            <button class="btn-delete" onclick="this.parentElement.remove()">×</button>
            <div class="card-custom">
                <div class="icon-circle mb-3"><i class="fas ${icono}"></i></div>
                <h5>${titulo}</h5>
                <p>${desc}</p>
            </div>
        </div>`;
    
    document.getElementById('contenedor-servicios').insertAdjacentHTML('beforeend', nuevoServicio);
    cerrarYLimpiar('modalServicio', this);
});

// 2. Agregar Equipo
document.getElementById('formEquipo')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const nombre = this.querySelector('input').value;
    const tipo = this.querySelector('select').value;

    const nuevoEquipo = `
        <div class="col-6 col-md-2 position-relative card-admin-item">
            <button class="btn-delete" onclick="this.parentElement.remove()">×</button>
            <div class="team-card">
                <i class="fas fa-trophy mb-2"></i>
                <h6>${nombre}</h6>
                <span>${tipo}</span>
            </div>
        </div>`;

    document.getElementById('contenedor-equipos').insertAdjacentHTML('beforeend', nuevoEquipo);
    cerrarYLimpiar('modalEquipo', this);
});

// 3. Agregar Evento
document.getElementById('formEvento')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const nombre = this.querySelectorAll('input')[0].value;
    const fecha = this.querySelectorAll('input')[1].value;
    const sede = this.querySelectorAll('input')[2].value;

    const nuevoEvento = `
        <div class="event-item position-relative card-admin-item">
            <button class="btn-delete" onclick="this.parentElement.remove()">×</button>
            <div class="d-flex justify-content-between align-items-start">
                <div class="text-start">
                    <h6>${nombre}</h6>
                    <div class="event-info-group">
                        <span><i class="far fa-calendar-alt"></i> ${fecha}</span>
                        <span><i class="fas fa-trophy"></i> ${sede}</span>
                    </div>
                </div>
                <i class="fas fa-video orange-text fa-lg"></i>
            </div>
        </div>`;

    document.getElementById('contenedor-eventos').insertAdjacentHTML('beforeend', nuevoEvento);
    cerrarYLimpiar('modalEvento', this);
});

// Utilidad para cerrar modal y limpiar formulario
function cerrarYLimpiar(modalId, form) {
    const modalElement = document.getElementById(modalId);
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();
    form.reset();
}

// Función genérica para cerrar modales al enviar
const setupForm = (formId, modalId) => {
    const form = document.getElementById(formId);
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Datos guardados correctamente en Magnoliga');
            const modalElement = document.getElementById(modalId);
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
            form.reset();
        });
    }
};

setupForm('formEvento', 'modalEvento');
setupForm('formEquipo', 'modalEquipo');
setupForm('formServicio', 'modalServicio');