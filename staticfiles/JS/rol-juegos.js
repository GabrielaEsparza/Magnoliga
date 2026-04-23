// ══════════════════════════════════════════
// rol-juegos.js  —  Magnoliga (API version)
// ══════════════════════════════════════════

// ── CSRF ────────────────────────────────────
function getCookie(name) {
  const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return v ? v.pop() : '';
}

async function api(url, method = 'GET', body = null) {
  const opts = {
    method,
    headers: { 'X-CSRFToken': getCookie('csrftoken') },
  };
  if (body && !(body instanceof FormData)) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    opts.body = body;
  }
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── STATE ────────────────────────────────────
let categoriaActual = null;
let editingPartidoId = null;
let matchModal;

// ── HELPERS ──────────────────────────────────
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

function showToast(msg, isError = false) {
  const el = document.getElementById('liveToast');
  if (!el) return;
  el.className = 'toast align-items-center text-white border-0' + (isError ? ' toast-error' : '');
  document.getElementById('toastMsg').textContent = msg;
  bootstrap.Toast.getOrCreateInstance(el, { delay: 2200 }).show();
}

// ── RENDER PARTIDOS ───────────────────────────
async function renderPartidos() {
  const container = document.getElementById('matches-container');
  const empty     = document.getElementById('matches-empty');
  container.innerHTML = '<p class="text-white-50 small">Cargando...</p>';

  let partidos = [];
  try {
    partidos = await api(`/api/rol/categorias/${categoriaActual}/partidos/`);
  } catch(e) {
    container.innerHTML = '<p class="text-danger small">Error cargando partidos</p>';
    return;
  }

  container.innerHTML = '';

  if (partidos.length === 0) {
    empty.classList.remove('d-none');
    return;
  }
  empty.classList.add('d-none');

  partidos.forEach(p => {
    const div = document.createElement('div');
    div.className = 'match-item p-3 mb-3 reveal-up';

    const adminBtns = typeof ES_ADMIN !== 'undefined' && ES_ADMIN ? `
      <div class="d-flex gap-1">
        <button class="btn btn-sm btn-edit text-warning p-1" data-id="${p.id}" title="Editar">
          <i class="bi bi-pencil-square"></i>
        </button>
        <button class="btn btn-sm btn-del text-danger p-1" data-id="${p.id}" title="Eliminar">
          <i class="bi bi-trash"></i>
        </button>
      </div>` : '';

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
          ${adminBtns}
        </div>
      </div>`;

    container.appendChild(div);
  });

  // Actualizar fecha en header
  const primero = partidos.find(p => p.fecha);
  if (primero) {
    document.getElementById('expanded-cat-date').innerText = formatFecha(primero.fecha);
  }

  // Actualizar fecha en tarjeta del grid
  const card = document.getElementById('card-' + categoriaActual);
  if (card && primero) {
    const spanFecha = card.querySelector('.card-footer-info .date');
    if (spanFecha) spanFecha.textContent = formatFecha(primero.fecha);
  }

  // Eventos editar/eliminar
  container.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => abrirModalEditar(+btn.dataset.id, partidos));
  });
  container.querySelectorAll('.btn-del').forEach(btn => {
    btn.addEventListener('click', () => eliminarPartido(+btn.dataset.id));
  });
}

// ── MODAL ─────────────────────────────────────
function abrirModalNuevo() {
  editingPartidoId = null;
  document.getElementById('matchModalLabel').innerText = 'Agregar partido';
  document.getElementById('matchDate').value  = '';
  document.getElementById('matchTime').value  = '';
  document.getElementById('matchCourt').value = '';
  document.getElementById('team1').value      = '';
  document.getElementById('team2').value      = '';
  document.getElementById('match-error').classList.add('d-none');
  matchModal.show();
}

function abrirModalEditar(partidoId, partidos) {
  editingPartidoId = partidoId;
  const p = partidos.find(x => x.id === partidoId);
  document.getElementById('matchModalLabel').innerText = 'Editar partido';
  document.getElementById('matchDate').value  = p.fecha  || '';
  document.getElementById('matchTime').value  = p.hora   || '';
  document.getElementById('matchCourt').value = p.cancha || '';
  document.getElementById('team1').value      = p.t1     || '';
  document.getElementById('team2').value      = p.t2     || '';
  document.getElementById('match-error').classList.add('d-none');
  matchModal.show();
}

async function guardarPartido() {
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

  const body = { t1, t2, hora, cancha, fecha: fecha || null };

  try {
    if (editingPartidoId === null) {
      await api(`/api/rol/categorias/${categoriaActual}/partidos/`, 'POST', body);
      showToast('Partido agregado');
    } else {
      await api(`/api/rol/partidos/${editingPartidoId}/`, 'PUT', body);
      showToast('Partido actualizado');
    }
    matchModal.hide();
    await renderPartidos();
  } catch(e) {
    showToast('Error al guardar', true);
  }
}

async function eliminarPartido(partidoId) {
  if (!confirm('¿Eliminar este partido?')) return;
  try {
    await api(`/api/rol/partidos/${partidoId}/`, 'DELETE');
    await renderPartidos();
    showToast('Partido eliminado');
  } catch(e) {
    showToast('Error al eliminar', true);
  }
}

// ── FOTO TARJETA ──────────────────────────────
window.abrirCambioFoto = function(inputId) {
  document.getElementById(inputId).click();
};

window.cambiarFotoTarjeta = async function(inputEl, cardEl, slug) {
  const file = inputEl.files[0];
  if (!file) return;
  // Preview inmediato
  cardEl.style.backgroundImage = `url('${URL.createObjectURL(file)}')`;
  // Guardar en BD
  const fd = new FormData();
  fd.append('imagen', file);
  try {
    await api(`/api/rol/categorias/${slug}/foto/`, 'POST', fd);
    showToast('Foto actualizada');
  } catch(e) {
    showToast('Error al subir foto', true);
  }
};

// ── EXPANDIR / CERRAR ─────────────────────────
window.expandirPartidos = async function(slug, titulo) {
  categoriaActual = slug;
  document.getElementById('expanded-cat-title').innerText = titulo || 'Categoría';
  document.getElementById('expanded-cat-date').innerText  = '';
  document.getElementById('categories-grid').classList.add('d-none');
  document.getElementById('nota-importante').classList.add('d-none');
  document.getElementById('matches-section').classList.remove('d-none');
  await renderPartidos();
  document.getElementById('matches-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.cerrarPartidos = function() {
  document.getElementById('matches-section').classList.add('d-none');
  document.getElementById('categories-grid').classList.remove('d-none');
  document.getElementById('nota-importante').classList.remove('d-none');
};

// ── RENDER CATEGORÍAS ────────────────────────
async function cargarCategorias() {
  try {
    const cats = await api('/api/rol/categorias/');
    const grid = document.getElementById('categories-grid');
    // Insertar tarjetas antes del botón de agregar (si existe)
    const btnAgregar = document.getElementById('card-add-cat');

    cats.forEach((cat, i) => {
      const div = document.createElement('div');
      div.className = 'reveal-up';
      div.style.animationDelay = `${i * 0.1}s`;
      div.id = `wrapper-${cat.slug}`;

      const bg = cat.imagen ? cat.imagen : '/static/assets/+40.jpeg';
      const adminBtns = ES_ADMIN ? `
        <button class="btn-change-photo-rol" onclick="event.stopPropagation(); document.getElementById('file-${cat.slug}').click()">
          <i class="bi bi-image me-1"></i>Cambiar foto
        </button>
        <input type="file" id="file-${cat.slug}" accept="image/*" class="d-none"
               onchange="cambiarFotoTarjeta(this, document.getElementById('card-${cat.slug}'), '${cat.slug}')">
        <button class="btn-delete-cat" onclick="event.stopPropagation(); eliminarCategoria(&quot;${cat.slug}&quot;)" title="Eliminar categoría">
          <i class="bi bi-trash3"></i>
        </button>` : '';

      div.innerHTML = `
        <div class="category-card category-card-rect"
             id="card-${cat.slug}"
             onclick="expandirPartidos('${cat.slug}', '${cat.nombre}')"
             style="background-image: url('${bg}');">
          <div class="card-overlay"></div>
          <div class="card-content-centered text-center">
            <h3>${cat.nombre}</h3>
          </div>
          <div class="card-footer-info">
            <span class="date text-orange"></span>
            <span class="click-prompt">Click para ver partidos <i class="bi bi-arrow-right-short"></i></span>
          </div>
          ${adminBtns}
        </div>`;

      if (btnAgregar) {
        grid.insertBefore(div, btnAgregar);
      } else {
        grid.appendChild(div);
      }
    });
  } catch(e) {
    console.error('Error cargando categorías', e);
  }
}

async function eliminarCategoria(slug) {
  if (!confirm('¿Eliminar esta categoría y todos sus partidos?')) return;
  try {
    await api(`/api/rol/categorias/${slug}/`, 'DELETE');
    const wrapper = document.getElementById(`wrapper-${slug}`);
    if (wrapper) wrapper.remove();
    showToast('Categoría eliminada');
  } catch(e) {
    showToast('Error al eliminar', true);
  }
}

function abrirModalAgregarCategoria() {
  document.getElementById('new-cat-nombre').value = '';
  document.getElementById('new-cat-slug').value   = '';
  document.getElementById('new-cat-error').classList.add('d-none');
  new bootstrap.Modal(document.getElementById('modalAgregarCategoria')).show();
}

async function guardarNuevaCategoria() {
  const nombre = document.getElementById('new-cat-nombre').value.trim();
  const slug   = document.getElementById('new-cat-slug').value.trim()
                   .toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  if (!nombre || !slug) {
    document.getElementById('new-cat-error').classList.remove('d-none');
    return;
  }
  try {
    await api('/api/rol/categorias/', 'POST', { nombre, slug });
    bootstrap.Modal.getInstance(document.getElementById('modalAgregarCategoria')).hide();
    // Recargar el grid completo
    document.querySelectorAll('[id^="wrapper-"]').forEach(el => el.remove());
    await cargarCategorias();
    showToast('Categoría agregada');
  } catch(e) {
    document.getElementById('new-cat-error').textContent = 'Error: el slug ya existe o datos inválidos.';
    document.getElementById('new-cat-error').classList.remove('d-none');
  }
}

// ── INIT ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', async function() {
  const modalEl = document.getElementById('matchModal');
  if (modalEl) matchModal = new bootstrap.Modal(modalEl);

  const btnAdd  = document.getElementById('btn-add-match');
  const btnSave = document.getElementById('btn-save-match');
  if (btnAdd)  btnAdd.addEventListener('click',  abrirModalNuevo);
  if (btnSave) btnSave.addEventListener('click', guardarPartido);

  const btnSaveCat = document.getElementById('btn-save-new-cat');
  if (btnSaveCat) btnSaveCat.addEventListener('click', guardarNuevaCategoria);

  await cargarCategorias();
});
