(function () {
    // Datos iniciales para que no se vea vacío
    let partidosData = [
        { categoria: 'cat_1', t1: 'LOBOS GDL', t2: 'SPARTANS', hora: '18:00 HRS', cancha: 'Cancha 1' },
        { categoria: 'cat_1', t1: 'TITANES', t2: 'REYES', hora: '20:00 HRS', cancha: 'Cancha 2' },
        { categoria: 'cat_2', t1: 'EQUIPO A', t2: 'EQUIPO B', hora: '19:00 HRS', cancha: 'Cancha Central' }
    ];

    let editIndex = null;
    let categoriaActual = "";
    let matchModal;

    document.addEventListener("DOMContentLoaded", () => {
        // Inicializar modal
        const modalEl = document.getElementById('matchModal');
        if(modalEl) matchModal = new bootstrap.Modal(modalEl);
        
        const btnSave = document.getElementById('btn-save-match');
        const btnAdd = document.getElementById('btn-add-match');

        if(btnAdd) {
            btnAdd.onclick = () => {
                editIndex = null;
                document.getElementById('matchModalLabel').innerText = "Nuevo Partido";
                document.getElementById('team1').value = "";
                document.getElementById('team2').value = "";
                document.getElementById('matchTime').value = "";
                document.getElementById('matchCourt').value = "";
                matchModal.show();
            };
        }

        if(btnSave) {
            btnSave.onclick = () => {
                const p = {
                    categoria: categoriaActual,
                    t1: document.getElementById('team1').value,
                    t2: document.getElementById('team2').value,
                    hora: document.getElementById('matchTime').value,
                    cancha: document.getElementById('matchCourt').value
                };
                if(editIndex === null) { partidosData.push(p); } 
                else { partidosData[editIndex] = p; }
                matchModal.hide();
                renderPartidos();
            };
        }
    });

    // Función que recibe los datos de la card
    window.expandirPartidos = function(catId, titulo, fecha) {
        categoriaActual = catId;
        
        // Poner el título y fecha en el cuadro naranja
        document.getElementById('expanded-cat-title').innerText = titulo;
        if(fecha) document.getElementById('expanded-cat-date').innerText = fecha;
        
        document.getElementById('categories-grid').classList.add('d-none');
        document.querySelector('.important-note-box').classList.add('d-none');
        document.getElementById('matches-section').classList.remove('d-none');
        
        renderPartidos();
    };

    window.renderPartidos = function() {
        const container = document.getElementById('matches-container');
        container.innerHTML = "";
        
        // Solo mostramos los de la categoría seleccionada
        partidosData.forEach((p, index) => {
            if(p.categoria === categoriaActual) {
                const div = document.createElement('div');
                div.className = "match-item d-flex justify-content-between align-items-center p-3 mb-2 reveal-up";
                div.innerHTML = `
                    <div class="teams flex-grow-1">
                        <span class="fw-bold text-white">${p.t1}</span>
                        <span class="mx-3 text-orange fw-bold">VS</span>
                        <span class="fw-bold text-white">${p.t2}</span>
                    </div>
                    <div class="text-end me-4">
                        <span class="d-block text-white fw-bold">${p.hora}</span>
                        <span class="small text-white-50">${p.cancha}</span>
                    </div>
                    <div class="btns">
                        <button class="btn btn-sm text-warning" onclick="editarPartido(${index})"><i class="bi bi-pencil-square"></i></button>
                        <button class="btn btn-sm text-danger" onclick="eliminarPartido(${index})"><i class="bi bi-trash"></i></button>
                    </div>
                `;
                container.appendChild(div);
            }
        });
    };

    window.editarPartido = function(idx) {
        editIndex = idx;
        const p = partidosData[idx];
        document.getElementById('team1').value = p.t1;
        document.getElementById('team2').value = p.t2;
        document.getElementById('matchTime').value = p.hora;
        document.getElementById('matchCourt').value = p.cancha;
        document.getElementById('matchModalLabel').innerText = "Editar Partido";
        matchModal.show();
    };

    window.eliminarPartido = function(idx) {
        if(confirm("¿Borrar partido?")) {
            partidosData.splice(idx, 1);
            renderPartidos();
        }
    };

    window.cerrarPartidos = function() {
        document.getElementById('matches-section').classList.add('d-none');
        document.getElementById('categories-grid').classList.remove('d-none');
        document.querySelector('.important-note-box').classList.remove('d-none');
    };
})();