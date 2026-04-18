(function () {

    // ── Estado ──────────────────────────────────────────────────────
    let partidosData = [
        { categoria: 'cat_1', t1: 'LOBOS GDL', t2: 'SPARTANS', fecha: '2026-03-29', hora: '18:00', cancha: 'Cancha 1 - Domo Code' },
        { categoria: 'cat_1', t1: 'TITANES',   t2: 'REYES',    fecha: '2026-03-29', hora: '20:00', cancha: 'Cancha 2' },
        { categoria: 'cat_2', t1: 'EQUIPO A',  t2: 'EQUIPO B', fecha: '2026-03-29', hora: '19:00', cancha: 'Cancha Central' }
    ];

    let editIndex       = null;
    let categoriaActual = '';
    let matchModal;

    // ── Helpers ─────────────────────────────────────────────────────
    function formatHora(time24) {
        if (!time24) return '';
        const [h, m] = time24.split(':').map(Number);
        const suffix = h >= 12 ? 'PM' : 'AM';
        const h12    = ((h % 12) || 12);
        return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
    }

    function formatFecha(dateStr) {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-');
        const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
        return `${parseInt(d)} ${meses[parseInt(m) - 1]} ${y}`;
    }

    // ── Render ──────────────────────────────────────────────────────
    function renderPartidos() {
        const container = document.getElementById('matches-container');
        const empty     = document.getElementById('matches-empty');
        container.innerHTML = '';

        const lista = partidosData
            .map((p, i) => ({ ...p, _idx: i }))
            .filter(p => p.categoria === categoriaActual);

        if (lista.length === 0) {
            empty.classList.remove('d-none');
            return;
        }
        empty.classList.add('d-none');

        lista.forEach(function (p) {
            const div = document.createElement('div');
            div.className = 'match-item p-3 mb-3 reveal-up';

            div.innerHTML = `
                <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
                    <div class="teams flex-grow-1">
                        <span class="fw-bold text-white fs-6">${p.t1}</span>
                        <span class="mx-2 mx-sm-3 text-orange fw-bold">VS</span>
                        <span class="fw-bold text-white fs-6">${p.t2}</span>
                    </div>
                    <div class="d-flex align-items-center gap-3 flex-shrink-0">
                        <div class="text-end">
                            <span class="d-block text-white fw-bold">${formatHora(p.hora)}</span>
                            <span class="small text-white-50">${p.cancha}</span>
                            ${p.fecha ? `<span class="d-block small text-orange">${formatFecha(p.fecha)}</span>` : ''}
                        </div>
                        <div class="d-flex gap-1">
                            <button class="btn btn-sm btn-edit text-warning p-1" data-idx="${p._idx}" title="Editar">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                            <button class="btn btn-sm btn-del text-danger p-1" data-idx="${p._idx}" title="Eliminar">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            container.appendChild(div);
        });

        container.querySelectorAll('.btn-edit').forEach(function (btn) {
            btn.addEventListener('click', function () { editarPartido(parseInt(this.dataset.idx)); });
        });
        container.querySelectorAll('.btn-del').forEach(function (btn) {
            btn.addEventListener('click', function () { eliminarPartido(parseInt(this.dataset.idx)); });
        });
    }

    // ── Modal nuevo ─────────────────────────────────────────────────
    function abrirModalNuevo() {
        editIndex = null;
        document.getElementById('matchModalLabel').innerText = 'Agregar partido';
        document.getElementById('matchDate').value  = '';
        document.getElementById('matchTime').value  = '';
        document.getElementById('matchCourt').value = '';
        document.getElementById('team1').value      = '';
        document.getElementById('team2').value      = '';
        document.getElementById('match-error').classList.add('d-none');
        matchModal.show();
    }

    // ── Editar ──────────────────────────────────────────────────────
    function editarPartido(idx) {
        editIndex = idx;
        const p   = partidosData[idx];
        document.getElementById('matchModalLabel').innerText = 'Editar partido';
        document.getElementById('matchDate').value  = p.fecha  || '';
        document.getElementById('matchTime').value  = p.hora   || '';
        document.getElementById('matchCourt').value = p.cancha || '';
        document.getElementById('team1').value      = p.t1     || '';
        document.getElementById('team2').value      = p.t2     || '';
        document.getElementById('match-error').classList.add('d-none');
        matchModal.show();
    }

    // ── Eliminar ────────────────────────────────────────────────────
    function eliminarPartido(idx) {
        if (confirm('¿Eliminar este partido?')) {
            partidosData.splice(idx, 1);
            renderPartidos();
            actualizarFechaTarjeta(categoriaActual);
        }
    }

    // ── Guardar ─────────────────────────────────────────────────────
    function guardarPartido() {
        const t1     = document.getElementById('team1').value.trim();
        const t2     = document.getElementById('team2').value.trim();
        const hora   = document.getElementById('matchTime').value.trim();
        const cancha = document.getElementById('matchCourt').value.trim();
        const fecha  = document.getElementById('matchDate').value;

        if (!t1 || !t2 || !hora || !cancha) {
            document.getElementById('match-error').classList.remove('d-none');
            return;
        }
        document.getElementById('match-error').classList.add('d-none');

        const partido = { categoria: categoriaActual, t1, t2, hora, cancha, fecha };

        if (editIndex === null) {
            partidosData.push(partido);
        } else {
            partidosData[editIndex] = partido;
        }

        matchModal.hide();
        renderPartidos();
        actualizarFechaTarjeta(categoriaActual);
    }

    // ── Actualizar fecha en tarjeta del grid ─────────────────────────
    function actualizarFechaTarjeta(catId) {
        const primerPartido = partidosData.find(p => p.categoria === catId && p.fecha);
        const card = document.getElementById('card-' + catId);
        if (!card) return;
        const spanFecha = card.querySelector('.card-footer-info .date');
        if (!spanFecha) return;
        if (primerPartido) {
            spanFecha.textContent = formatFecha(primerPartido.fecha);
        }
    }

    // ── Expandir categoría ──────────────────────────────────────────
    // ── Expandir categoría ──────────────────────────────────────────
window.expandirPartidos = function (catId, titulo) {
    categoriaActual = catId;
    document.getElementById('expanded-cat-title').innerText = titulo || 'Categoría';

    // Tomar la fecha del primer partido de esta categoría
    const primerPartido = partidosData.find(p => p.categoria === catId && p.fecha);
    document.getElementById('expanded-cat-date').innerText = primerPartido
        ? formatFecha(primerPartido.fecha)
        : '';

    document.getElementById('categories-grid').classList.add('d-none');
    document.getElementById('nota-importante').classList.add('d-none');
    document.getElementById('matches-section').classList.remove('d-none');
    renderPartidos();
    document.getElementById('matches-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
};
    // ── Cerrar ──────────────────────────────────────────────────────
    window.cerrarPartidos = function () {
        document.getElementById('matches-section').classList.add('d-none');
        document.getElementById('categories-grid').classList.remove('d-none');
        document.getElementById('nota-importante').classList.remove('d-none');
    };

    // ── Init ────────────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', function () {
        const modalEl = document.getElementById('matchModal');
        if (modalEl) matchModal = new bootstrap.Modal(modalEl);

        const btnAdd  = document.getElementById('btn-add-match');
        const btnSave = document.getElementById('btn-save-match');
        if (btnAdd)  btnAdd.addEventListener('click',  abrirModalNuevo);
        if (btnSave) btnSave.addEventListener('click', guardarPartido);

        // Inicializar fechas en tarjetas con los datos existentes
        ['cat_1','cat_2','cat_3','cat_4','cat_5','cat_6','cat_7','cat_8','cat_9','cat_10','cat_11','cat_12']
            .forEach(actualizarFechaTarjeta);
    });

    // ── Cambio de foto por tarjeta ──────────────────────────────
    window.abrirCambioFoto = function (inputId) {
        document.getElementById(inputId).click();
    };

    window.cambiarFotoTarjeta = function (inputEl, cardEl) {
        const file = inputEl.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        cardEl.style.backgroundImage = `url('${url}')`;
    };

})();