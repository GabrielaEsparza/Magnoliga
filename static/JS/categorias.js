// ══════════════════════════════════════════
// categorias.js  —  Magnoliga (API version)
// ══════════════════════════════════════════

// ── STATE ──────────────────────────────────
const state = {
  currentCatId:     null,
  currentCatIdx:    null,
  editingCatId:     null,
  editingRowId:     null,
  editingGame:      null,
  addingPlayerTeamId: null,
  addingPlayerTeamName: null,
  openAccordions:   new Set(),
  dragMode:         false,
  categories:       [],
};

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

// ── BOOTSTRAP MODAL INSTANCES ──────────────
let bsCatModal, bsEditModal, bsEditRowModal, bsAddPlayerModal, bsEditGameModal;

document.addEventListener('DOMContentLoaded', async () => {
  bsCatModal       = new bootstrap.Modal(document.getElementById('catModal'));
  bsEditModal      = new bootstrap.Modal(document.getElementById('editModal'));
  bsEditRowModal   = new bootstrap.Modal(document.getElementById('editRowModal'));
  bsAddPlayerModal = new bootstrap.Modal(document.getElementById('addPlayerModal'));
  bsEditGameModal  = new bootstrap.Modal(document.getElementById('editGameModal'));

  document.querySelectorAll('.modal-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane-cat').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
      const t = btn.dataset.tab;
      if (t === 'tabla')   { state.dragMode = false; renderStandings(); }
      if (t === 'equipos') renderEquipos();
      if (t === 'galeria') renderGaleria();
    });
  });

  document.getElementById('catModal').addEventListener('hidden.bs.modal', () => {
    state.openAccordions.clear();
    state.dragMode = false;
    resetTabs();
  });

  await loadCategories();
});

// ── HELPERS ────────────────────────────────
function toggleEl(id) {
  document.getElementById(id).classList.toggle('visible');
}

function showToast(msg, isError = false) {
  const el = document.getElementById('liveToast');
  el.className = 'toast align-items-center text-white border-0' + (isError ? ' toast-error' : '');
  document.getElementById('toastMsg').textContent = msg;
  bootstrap.Toast.getOrCreateInstance(el, { delay: 2200 }).show();
}

function resetTabs() {
  document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-pane-cat').forEach(p => p.classList.remove('active'));
  document.querySelector('[data-tab="jornadas"]').classList.add('active');
  document.getElementById('tab-jornadas').classList.add('active');
}

function currentCat() {
  return state.categories.find(c => c.id === state.currentCatId);
}

// ── CARGAR CATEGORÍAS DESDE API ─────────────
async function loadCategories() {
  try {
    state.categories = await api('/api/categorias/');
    renderCategories();
  } catch(e) {
    showToast('Error cargando categorías', true);
  }
}

// ── CATEGORÍAS ─────────────────────────────
function renderCategories() {
  const grid = document.getElementById('categoriesGrid');
  grid.innerHTML = '';

  state.categories.forEach((cat, i) => {
    const col = document.createElement('div');
    col.className = 'col-6 col-sm-4 col-lg-3';
    const imgSrc = cat.imagen || '/static/assets/magnoliga-categorias.jpg';
    const deleteBtn = ES_ADMIN ? `
      <button class="btn-del-cat" onclick="event.stopPropagation(); deleteCategory(${cat.id})" title="Eliminar">
        <i class="bi bi-trash"></i>
      </button>` : '';
    col.innerHTML = `
      <div class="cat-card" onclick="openCatModal(${cat.id})">
        <img src="${imgSrc}" alt="${cat.nombre}" loading="lazy">
        <div class="cat-overlay"><span class="cat-name">${cat.nombre}</span></div>
        ${deleteBtn}
      </div>`;
    grid.appendChild(col);
  });

  if (typeof ES_ADMIN !== 'undefined' && ES_ADMIN) {
    const addCol = document.createElement('div');
    addCol.className = 'col-6 col-sm-4 col-lg-3';
    addCol.innerHTML = `
      <button class="btn-add-cat" onclick="addCategory()">
        <span class="add-icon">＋</span>
        <span>Nueva Categoría</span>
      </button>`;
    grid.appendChild(addCol);
  }
}

async function deleteCategory(catId) {
  if (!confirm('¿Eliminar esta categoría? Se borrarán todos sus datos.')) return;
  try {
    await api(`/api/categorias/${catId}/`, 'DELETE');
    await loadCategories();
    showToast('Categoría eliminada');
  } catch(e) {
    showToast('Error al eliminar', true);
  }
}

async function openCatModal(catId) {
  state.currentCatId = catId;
  state.openAccordions.clear();
  state.dragMode = false;
  const cat = currentCat();
  document.getElementById('modalCatName').textContent = cat.nombre;
  resetTabs();
  document.querySelectorAll('.cat-collapsible.visible').forEach(el => el.classList.remove('visible'));
  await renderJornadas();
  bsCatModal.show();
}

function openEditCat(e, catId) {
  e.stopPropagation();
  state.editingCatId = catId;
  const cat = state.categories.find(c => c.id === catId);
  document.getElementById('editCatName').value = cat.nombre;
  bsEditModal.show();
}

async function saveEditCat() {
  const n = document.getElementById('editCatName').value.trim();
  if (!n) return;
  try {
    await api(`/api/categorias/${state.editingCatId}/`, 'PUT', { nombre: n });
    await loadCategories();
    bsEditModal.hide();
    showToast('Categoría actualizada');
  } catch(e) {
    showToast('Error al actualizar', true);
  }
}

async function addCategory() {
  const name = prompt('Nombre de la nueva categoría:');
  if (!name) return;
  try {
    await api('/api/categorias/', 'POST', { nombre: name });
    await loadCategories();
    showToast('Categoría creada');
  } catch(e) {
    showToast('Error al crear categoría', true);
  }
}

function openCatPhotoUpload() {
  const input = document.getElementById('catPhotoInput');
  input.value = '';
  input.onchange = null;
  input.addEventListener('change', async function handler(e) {
    input.removeEventListener('change', handler);
    const file = input.files[0];
    if (!file) {
      showToast('No se seleccionó archivo', true);
      return;
    }
    const fd = new FormData();
    fd.append('imagen', file);
    try {
      await api(`/api/categorias/${state.currentCatId}/foto/`, 'POST', fd);
      await loadCategories();
      showToast('Foto actualizada');
    } catch(err) {
      showToast('Error al subir foto', true);
    }
  });
  input.click();
}

// ── JORNADAS ───────────────────────────────
async function renderJornadas() {
  const list = document.getElementById('jornadasList');
  list.innerHTML = '<p class="text-secondary small">Cargando...</p>';
  let jornadas = [];
  try {
    jornadas = await api(`/api/categorias/${state.currentCatId}/jornadas/`);
  } catch(e) {
    list.innerHTML = '<p class="text-danger small">Error cargando jornadas</p>';
    return;
  }
  list.innerHTML = '';

  jornadas.forEach((jornada, ji) => {
    const block = document.createElement('div');
    block.className = 'jornada-block';

    const gamesHTML = jornada.partidos.map((g) => {
      const dateFmt = g.fecha ? new Date(g.fecha + 'T00:00').toLocaleDateString('es-MX', { weekday:'short', day:'numeric', month:'short' }) : '';
      const editBtn = ES_ADMIN ? `
        <button class="btn-edit-game" onclick="openEditGame(${g.id}, ${jornada.id})">✏</button>
        <button class="btn-edit-game" onclick="deletePartido(${g.id})" style="color:#ef4444; border-color:#ef4444">🗑</button>` : '';

      if (g.pts_local !== null && g.pts_local !== undefined) {
        const lW = g.pts_local > g.pts_visit, vW = g.pts_visit > g.pts_local;
        return `<div class="game-row">
          <span class="game-team right">${g.local}</span>
          <div class="score-box">
            <span class="score-val ${lW?'win':'lose'}">${g.pts_local}</span>
            <span class="score-sep">-</span>
            <span class="score-val ${vW?'win':'lose'}">${g.pts_visit}</span>
          </div>
          <span class="game-team">${g.visitante}</span>
          <span class="game-time-badge">${dateFmt ? dateFmt+'<br>' : ''}${g.hora || ''} hrs</span>
          ${editBtn}
        </div>`;
      }
      return `<div class="game-row">
        <span class="game-team right">${g.local}</span>
        <span class="upcoming-vs">vs</span>
        <span class="game-team">${g.visitante}</span>
        <span class="game-time-badge">${dateFmt ? dateFmt+'<br>' : ''}${g.hora || ''} hrs</span>
        ${editBtn}
      </div>`;
    }).join('');

    const addPartidoBtn = ES_ADMIN ? `
      <div class="mt-2">
        <button class="btn btn-outline-secondary btn-sm" onclick="toggleEl('addGameJ${jornada.id}')">+ Partido</button>
      </div>
      <div class="cat-collapsible mt-2" id="addGameJ${jornada.id}">
        <div class="row g-2">
          <div class="col-md-6"><label class="form-label text-secondary small">Local</label><input type="text" class="form-control bg-input border-0 text-white" id="gj${jornada.id}-l" placeholder="Equipo local" autocomplete="off"></div>
          <div class="col-md-6"><label class="form-label text-secondary small">Visitante</label><input type="text" class="form-control bg-input border-0 text-white" id="gj${jornada.id}-v" placeholder="Equipo visitante" autocomplete="off"></div>
          <div class="col-md-6"><label class="form-label text-secondary small">Fecha</label><input type="date" class="form-control bg-input border-0 text-white" id="gj${jornada.id}-d"></div>
          <div class="col-md-6"><label class="form-label text-secondary small">Hora</label><input type="time" class="form-control bg-input border-0 text-white" id="gj${jornada.id}-t" value="18:00"></div>
          <div class="col-md-6"><label class="form-label text-secondary small">Pts Local</label><input type="number" class="form-control bg-input border-0 text-white" id="gj${jornada.id}-sl" placeholder="—" min="0"></div>
          <div class="col-md-6"><label class="form-label text-secondary small">Pts Visitante</label><input type="number" class="form-control bg-input border-0 text-white" id="gj${jornada.id}-sv" placeholder="—" min="0"></div>
        </div>
        <div class="d-flex gap-2 justify-content-end mt-2">
          <button class="btn btn-secondary btn-sm" onclick="toggleEl('addGameJ${jornada.id}')">Cancelar</button>
          <button class="btn btn-orange btn-sm fw-semibold" onclick="saveGameInJornada(${jornada.id})">Guardar</button>
        </div>
      </div>` : '';

    block.innerHTML = `
      <div class="jornada-header" onclick="this.parentElement.classList.toggle('open')">
        <strong>${jornada.label}</strong>
        <div class="d-flex align-items-center gap-2">
          ${ES_ADMIN ? `<button class="btn-del-jornada" onclick="event.stopPropagation(); deleteJornada(${jornada.id})"><i class="bi bi-trash"></i></button>` : ''}
          <span class="cat-chevron"><i class="bi bi-chevron-down"></i></span>
        </div>
      </div>
      <div class="jornada-body">
        ${gamesHTML}
        ${addPartidoBtn}
      </div>`;

    if (ji === 0) block.classList.add('open');
    list.appendChild(block);
  });
}

async function saveGame() {
  const local = document.getElementById('fj-local').value.trim();
  const visit = document.getElementById('fj-visit').value.trim();
  const fecha = document.getElementById('fj-date').value;
  const hora  = document.getElementById('fj-time').value;
  const slRaw = document.getElementById('fj-sl').value;
  const svRaw = document.getElementById('fj-sv').value;
  if (!local || !visit || !fecha) { showToast('Completa los datos', true); return; }

  try {
    const jornada = await api(`/api/categorias/${state.currentCatId}/jornadas/`, 'POST', { fecha });
    await api(`/api/jornadas/${jornada.id}/partidos/`, 'POST', {
      local, visitante: visit,
      fecha, hora,
      pts_local: slRaw !== '' ? +slRaw : null,
      pts_visit: svRaw !== '' ? +svRaw : null,
    });
    ['fj-local','fj-visit','fj-date','fj-sl','fj-sv'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('addJornadaForm').classList.remove('visible');
    await renderJornadas();
    showToast('Jornada agregada');
  } catch(e) {
    showToast('Error al guardar', true);
  }
}

async function saveGameInJornada(jornadaId) {
  const l   = document.getElementById(`gj${jornadaId}-l`).value.trim();
  const v   = document.getElementById(`gj${jornadaId}-v`).value.trim();
  const d   = document.getElementById(`gj${jornadaId}-d`).value;
  const t   = document.getElementById(`gj${jornadaId}-t`).value;
  const slR = document.getElementById(`gj${jornadaId}-sl`).value;
  const svR = document.getElementById(`gj${jornadaId}-sv`).value;
  if (!l || !v) { showToast('Ingresa ambos equipos', true); return; }
  try {
    await api(`/api/jornadas/${jornadaId}/partidos/`, 'POST', {
      local: l, visitante: v,
      fecha: d || null, hora: t || null,
      pts_local: slR !== '' ? +slR : null,
      pts_visit: svR !== '' ? +svR : null,
    });
    await renderJornadas();
    showToast('Partido guardado');
  } catch(e) {
    showToast('Error al guardar partido', true);
  }
}

async function openEditGame(partidoId, jornadaId) {
  state.editingGame = { partidoId, jornadaId };
  const jornadas = await api(`/api/categorias/${state.currentCatId}/jornadas/`);
  const jornada  = jornadas.find(j => j.id === jornadaId);
  const g        = jornada.partidos.find(p => p.id === partidoId);
  document.getElementById('eg-local').value = g.local;
  document.getElementById('eg-visit').value = g.visitante;
  document.getElementById('eg-date').value  = g.fecha  || '';
  document.getElementById('eg-time').value  = g.hora   || '18:00';
  document.getElementById('eg-sl').value    = (g.pts_local != null) ? g.pts_local : '';
  document.getElementById('eg-sv').value    = (g.pts_visit != null) ? g.pts_visit : '';
  bsEditGameModal.show();
}

async function saveGameEdit() {
  const { partidoId } = state.editingGame;
  const l   = document.getElementById('eg-local').value.trim();
  const v   = document.getElementById('eg-visit').value.trim();
  if (!l || !v) { showToast('Ingresa ambos equipos', true); return; }
  const slR = document.getElementById('eg-sl').value;
  const svR = document.getElementById('eg-sv').value;
  try {
    await api(`/api/partidos/${partidoId}/`, 'PUT', {
      local: l, visitante: v,
      fecha: document.getElementById('eg-date').value || null,
      hora:  document.getElementById('eg-time').value || null,
      pts_local: slR !== '' ? +slR : null,
      pts_visit: svR !== '' ? +svR : null,
    });
    bsEditGameModal.hide();
    await renderJornadas();
    showToast('Partido actualizado');
  } catch(e) {
    showToast('Error al actualizar', true);
  }
}

async function deleteJornada(jornadaId) {
  if (!confirm('¿Eliminar esta jornada y todos sus partidos?')) return;
  try {
    await api(`/api/jornadas/${jornadaId}/`, 'DELETE');
    await renderJornadas();
    showToast('Jornada eliminada');
  } catch(e) {
    showToast('Error al eliminar', true);
  }
}

async function deletePartido(partidoId) {
  if (!confirm('¿Eliminar este partido?')) return;
  try {
    await api(`/api/partidos/${partidoId}/`, 'DELETE');
    await renderJornadas();
    showToast('Partido eliminado');
  } catch(e) {
    showToast('Error al eliminar', true);
  }
}

// ── TABLA ──────────────────────────────────
async function renderStandings() {
  const body = document.getElementById('standingsBody');
  const tbl  = document.getElementById('standingsTable');
  body.innerHTML = '';
  tbl.classList.toggle('drag-mode', state.dragMode);
  const btn = document.getElementById('btnDragToggle');
  if (btn) {
    btn.classList.toggle('drag-active', state.dragMode);
    btn.textContent = state.dragMode ? '⠿ Reordenando…' : '⠿ Reordenar';
  }

  let standings = [];
  try {
    standings = await api(`/api/categorias/${state.currentCatId}/standings/`);
  } catch(e) { return; }

  standings.forEach((t, i) => {
    const dif = t.pf - t.pc;
    const tr  = document.createElement('tr');
    tr.dataset.id  = t.id;
    tr.dataset.idx = i;
    if (state.dragMode) {
      tr.draggable = true;
      tr.classList.add('drag-enabled');
      tr.addEventListener('dragstart', dragStart);
      tr.addEventListener('dragover',  dragOver);
      tr.addEventListener('drop',      dropRow);
      tr.addEventListener('dragend',   dragEnd);
    }
    const editBtn = ES_ADMIN ? `<button class="btn btn-sm btn-secondary py-0 px-2" style="font-size:.7rem" onclick="openEditRow(${t.id})"><i class="bi bi-pencil"></i></button>` : '';
    tr.innerHTML = `
      <td><span class="pos-num">${i+1}</span></td>
      <td>${t.equipo}</td>
      <td class="val-gray">${t.jj}</td>
      <td class="val-green">${t.jg}</td>
      <td class="val-red">${t.jp}</td>
      <td>${t.pf}</td><td>${t.pc}</td>
      <td class="${dif>=0?'val-green':'val-red'}">${dif>0?'+':''}${dif}</td>
      <td><span class="pts-badge">${t.pts}</span></td>
      <td class="text-nowrap">${editBtn}<span class="drag-handle ms-1">⠿</span></td>`;
    body.appendChild(tr);
  });
}

function toggleDragMode() {
  state.dragMode = !state.dragMode;
  renderStandings();
  showToast(state.dragMode ? 'Modo reordenar activado' : 'Orden guardado');
}

let dragSrcIdx = null;
function dragStart(e) { dragSrcIdx = +e.currentTarget.dataset.idx; e.currentTarget.classList.add('dragging'); }
function dragOver(e)  { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }
function dragEnd(e)   { document.querySelectorAll('#standingsBody tr').forEach(r => r.classList.remove('dragging','drag-over')); }
async function dropRow(e) {
  e.preventDefault();
  const dest    = +e.currentTarget.dataset.idx;
  const destId  = +e.currentTarget.dataset.id;
  if (dragSrcIdx === null || dragSrcIdx === dest) return;
  try {
    await api(`/api/standings/${destId}/`, 'PUT', { orden: dragSrcIdx });
  } catch(e) {}
  dragSrcIdx = null;
  await renderStandings();
}

async function addTeamToStandings() {
  const name = document.getElementById('ft-name').value.trim();
  if (!name) return;
  try {
    await api(`/api/categorias/${state.currentCatId}/standings/`, 'POST', { equipo: name });
    document.getElementById('ft-name').value = '';
    document.getElementById('addTeamForm').classList.remove('visible');
    await renderStandings();
    showToast('Equipo agregado');
  } catch(e) {
    showToast('Error al agregar equipo', true);
  }
}

async function openEditRow(standingId) {
  state.editingRowId = standingId;
  const standings = await api(`/api/categorias/${state.currentCatId}/standings/`);
  const t = standings.find(s => s.id === standingId);
  ['jj','jg','jp','pf','pc','pts'].forEach(f => document.getElementById(`er-${f}`).value = t[f]);
  bsEditRowModal.show();
}

async function saveRowEdit() {
  const body = {};
  ['jj','jg','jp','pf','pc','pts'].forEach(f => body[f] = +document.getElementById(`er-${f}`).value);
  try {
    await api(`/api/standings/${state.editingRowId}/`, 'PUT', body);
    bsEditRowModal.hide();
    await renderStandings();
    showToast('Estadísticas guardadas');
  } catch(e) {
    showToast('Error al guardar', true);
  }
}

// ── EQUIPOS ────────────────────────────────
async function addTeamFromEquipos() {
  const name = document.getElementById('eq-team-name').value.trim();
  if (!name) return;
  try {
    await api(`/api/categorias/${state.currentCatId}/equipos/`, 'POST', { nombre: name });
    await api(`/api/categorias/${state.currentCatId}/standings/`, 'POST', { equipo: name });
    document.getElementById('eq-team-name').value = '';
    document.getElementById('addTeamFormEq').classList.remove('visible');
    state.openAccordions.add(name);
    await renderEquipos();
    showToast('Equipo agregado');
  } catch(e) {
    showToast('Error al agregar equipo', true);
  }
}

async function renderEquipos() {
  const container = document.getElementById('equiposAccordion');
  container.innerHTML = '<p class="text-secondary small">Cargando...</p>';

  let equipos = [];
  try {
    equipos = await api(`/api/categorias/${state.currentCatId}/equipos/`);
  } catch(e) {
    container.innerHTML = '<p class="text-danger small">Error cargando equipos</p>';
    return;
  }

  container.innerHTML = '';

  if (equipos.length === 0) {
    container.innerHTML = `<p class="text-secondary small text-center py-4">No hay equipos. Agrega uno con el botón de arriba.</p>`;
    return;
  }

  // Obtener todos los partidos de la categoría
  let todosPartidos = [];
  try {
    const jornadas = await api(`/api/categorias/${state.currentCatId}/jornadas/`);
    jornadas.forEach(j => j.partidos.forEach(p => todosPartidos.push({ ...p, jornadaId: j.id })));
  } catch(e) {}

  equipos.forEach(equipo => {
    const players = equipo.jugadores || [];

    // Solo partidos donde jugó este equipo
    const partidos = todosPartidos.filter(p =>
      p.local.toLowerCase().includes(equipo.nombre.toLowerCase()) ||
      p.visitante.toLowerCase().includes(equipo.nombre.toLowerCase())
    );

    let ths = `<th>#&nbsp; Jugador/a</th>`;
    for (let i = 0; i < partidos.length; i++) {
      ths += `<th class="th-partido">${partidos[i].local}<br>vs<br>${partidos[i].visitante}</th>`;
    }
    ths += `<th>Total</th>`;

    const trs = players.map(jugador => {
      let cells = '';
      for (let i = 0; i < partidos.length; i++) {
        cells += `<td><button class="att-cell empty" data-jugador="${jugador.id}" data-jornada="${partidos[i].jornadaId}" onclick="toggleAtt(this)">·</button></td>`;
      }
      return `<tr>
        <td>#${jugador.numero}&nbsp; ${jugador.nombre}</td>
        ${cells}
        <td class="att-total" id="total_${jugador.id}">0/${partidos.length}</td>
      </tr>`;
    }).join('');

    const isOpen = state.openAccordions.has(equipo.nombre);
    const wrapId = 'attWrap_' + equipo.id;
    const addBtns = ES_ADMIN ? `
      <div class="d-flex gap-2 flex-wrap mt-3">
        <button class="btn-ghost-dashed" onclick="openAddPlayer(${equipo.id}, '${equipo.nombre}')"><i class="bi bi-person-plus me-1"></i>Agregar jugador/a</button>
      </div>` : '';

    const div = document.createElement('div');
    div.className    = 'team-accordion' + (isOpen ? ' open' : '');
    div.dataset.team = equipo.nombre;
    div.innerHTML = `
      <div class="team-acc-header" onclick="toggleAccordion('${equipo.nombre}')">
        <strong>${equipo.nombre}</strong>
        <i class="bi bi-chevron-down cat-chevron"></i>
      </div>
      <div class="team-acc-body">
        <p class="att-section-label">Asistencias por partido</p>
        <div class="att-scroll-outer">
          <div class="att-wrap" id="${wrapId}">
            <table class="att-table">
              <thead><tr>${ths}</tr></thead>
              <tbody>${trs || `<tr><td colspan="${partidos.length + 2}" class="text-secondary text-center py-3 small">Sin jugadores aún</td></tr>`}</tbody>
            </table>
          </div>
          <div class="att-nav">
            <button class="att-nav-btn" onclick="attScroll('${wrapId}',-180)"><i class="bi bi-chevron-left"></i></button>
            <span class="att-nav-info">← desliza →</span>
            <button class="att-nav-btn" onclick="attScroll('${wrapId}',180)"><i class="bi bi-chevron-right"></i></button>
          </div>
        </div>
        ${addBtns}
      </div>`;
    container.appendChild(div);
  });

  await loadAsistencias(equipos, todosPartidos);
}

async function loadAsistencias(equipos, todosPartidos) {
  try {
    const asistencias = await api(`/api/asistencias/?cat=${state.currentCatId}`);
    const mapa = {};
    asistencias.forEach(a => { mapa[`${a.jugador_id}_${a.jornada_id}`] = a.presente; });

    for (const equipo of equipos) {
      const partidos = todosPartidos.filter(p =>
        p.local.toLowerCase().includes(equipo.nombre.toLowerCase()) ||
        p.visitante.toLowerCase().includes(equipo.nombre.toLowerCase())
      );

      for (const jugador of equipo.jugadores) {
        let presentes = 0;
        for (let i = 0; i < partidos.length; i++) {
          const btn = document.querySelector(
            `button.att-cell[data-jugador="${jugador.id}"][data-jornada="${partidos[i].jornadaId}"]`
          );
          if (!btn) continue;
          const val = mapa[`${jugador.id}_${partidos[i].jornadaId}`];
          if (val === true)       { btn.className = 'att-cell present'; btn.textContent = '✓'; presentes++; }
          else if (val === false) { btn.className = 'att-cell absent';  btn.textContent = '✗'; }
        }
        const totalEl = document.getElementById(`total_${jugador.id}`);
        if (totalEl) totalEl.textContent = `${presentes}/${partidos.length}`;
      }
    }
  } catch(e) { /* silencioso */ }
}

function attScroll(wrapId, delta) {
  const el = document.getElementById(wrapId);
  if (el) el.scrollLeft += delta;
}

function toggleAccordion(teamName) {
  if (state.openAccordions.has(teamName)) state.openAccordions.delete(teamName);
  else state.openAccordions.add(teamName);
  document.querySelectorAll('.team-accordion').forEach(el => {
    if (el.dataset.team === teamName) el.classList.toggle('open');
  });
}

async function toggleAtt(btn) {
  const jugadorId = btn.dataset.jugador;
  const jornadaId = btn.dataset.jornada;
  if (!jugadorId || !jornadaId) return;
  const cur  = btn.classList.contains('present') ? true : btn.classList.contains('absent') ? false : null;
  const next = cur === true ? false : true;
  try {
    await api('/api/asistencias/', 'POST', {
      jugador_id: +jugadorId,
      jornada_id: +jornadaId,
      presente:   next,
    });
    btn.className   = 'att-cell ' + (next ? 'present' : 'absent');
    btn.textContent = next ? '✓' : '✗';

    const totalEl = document.getElementById(`total_${jugadorId}`);
    if (totalEl) {
      const row = btn.closest('tr');
      const presentes = row.querySelectorAll('.att-cell.present').length;
      const total     = row.querySelectorAll('.att-cell').length;
      totalEl.textContent = `${presentes}/${total}`;
    }
  } catch(e) {
    console.error('Error asistencia:', e.message);
    showToast('Error al guardar asistencia', true);
  }
}

function openAddPlayer(equipoId, equipoNombre) {
  state.addingPlayerTeamId   = equipoId;
  state.addingPlayerTeamName = equipoNombre;
  document.getElementById('addPlayerTitle').textContent = `Agregar jugador/a — ${equipoNombre}`;
  document.getElementById('ap-name').value = '';
  document.getElementById('ap-num').value  = '';
  bsAddPlayerModal.show();
}

async function savePlayer() {
  const nombre = document.getElementById('ap-name').value.trim();
  const numero = document.getElementById('ap-num').value.trim();
  if (!nombre) return;
  try {
    await api(`/api/equipos/${state.addingPlayerTeamId}/jugadores/`, 'POST', { nombre, numero });
    bsAddPlayerModal.hide();
    state.openAccordions.add(state.addingPlayerTeamName);
    await renderEquipos();
    showToast('Jugador/a agregado/a');
  } catch(e) {
    showToast('Error al agregar jugador', true);
  }
}

// ── GALERÍA ────────────────────────────────
function getYouTubeId(url) {
  const patterns = [
    /[?&]v=([^&#]+)/,
    /youtu\.be\/([^?&#]+)/,
    /embed\/([^?&#]+)/,
    /shorts\/([^?&#]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function renderGaleria() {
  const grid = document.getElementById('galleryGrid');
  grid.innerHTML = '';
  let items = [];
  try {
    items = await api(`/api/categorias/${state.currentCatId}/galeria/`);
  } catch(e) { return; }

  items.forEach(item => {
    const col = document.createElement('div');
    col.className = 'col-md-4';
    const removeBtn = ES_ADMIN ? `<button class="gallery-img-remove" onclick="deleteGaleriaItem(${item.id}, this)"><i class="bi bi-x"></i></button>` : '';
    if (item.tipo === 'foto') {
      col.innerHTML = `
        <div class="gallery-img-card">
          <img src="${item.imagen}" alt="${item.titulo}">
          ${removeBtn}
        </div>`;
    } else {
      const videoId = getYouTubeId(item.video_url || '');
      col.innerHTML = `
        <div class="gallery-img-card">
          <div class="ratio ratio-16x9">
            <iframe src="https://www.youtube.com/embed/${videoId}" title="${item.titulo}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
          </div>
          ${item.titulo ? `<p class="gallery-video-title">${item.titulo}</p>` : ''}
          ${removeBtn}
        </div>`;
    }
    grid.appendChild(col);
  });

  if (ES_ADMIN) {
    const addPhoto = document.createElement('div');
    addPhoto.className = 'col-md-4';
    addPhoto.id = 'gallery-add-photo';
    addPhoto.innerHTML = `
      <label class="gallery-add d-flex flex-column align-items-center justify-content-center text-center" for="galleryUpload">
        <div class="icon-circle mb-2"><i class="bi bi-plus-lg fs-5"></i></div>
        <span class="text-white small fw-medium">Agregar foto</span>
      </label>
      <input type="file" id="galleryUpload" accept="image/*" class="d-none">`;
    grid.appendChild(addPhoto);
    document.getElementById('galleryUpload').addEventListener('change', addGalleryPhoto);

    const addVideo = document.createElement('div');
    addVideo.className = 'col-md-4';
    addVideo.id = 'gallery-add-video';
    addVideo.innerHTML = `
      <div class="gallery-add d-flex flex-column align-items-center justify-content-center text-center gap-2 p-3">
        <div class="icon-circle mb-1"><i class="bi bi-youtube fs-5"></i></div>
        <span class="text-white small fw-medium">Agregar video</span>
        <input type="text" id="youtubeTitle"
               class="form-control bg-input border-0 text-white text-center small"
               placeholder="Título del video">
        <input type="text" id="youtubeUrlInput"
               class="form-control bg-input border-0 text-white text-center small"
               placeholder="Link de YouTube">
        <button class="btn btn-orange btn-sm fw-semibold w-100"
                onclick="addGalleryVideo()">Agregar</button>
      </div>`;
    grid.appendChild(addVideo);
  }
}

async function addGalleryPhoto(e) {
  const file = e.target.files[0];
  if (!file) return;
  const fd = new FormData();
  fd.append('tipo', 'foto');
  fd.append('imagen', file);
  fd.append('csrfmiddlewaretoken', getCookie('csrftoken'));
  try {
    await api(`/api/categorias/${state.currentCatId}/galeria/`, 'POST', fd);
    await renderGaleria();
    showToast('Foto agregada');
  } catch(e) {
    showToast('Error al subir foto', true);
  }
}

async function addGalleryVideo() {
  const input   = document.getElementById('youtubeUrlInput');
  const titleEl = document.getElementById('youtubeTitle');
  const url     = input.value.trim();
  const videoId = getYouTubeId(url);
  if (!videoId) { showToast('Link inválido', true); return; }
  const fd = new FormData();
  fd.append('tipo', 'video');
  fd.append('video_url', url);
  fd.append('titulo', titleEl.value.trim());
  fd.append('csrfmiddlewaretoken', getCookie('csrftoken'));
  try {
    await api(`/api/categorias/${state.currentCatId}/galeria/`, 'POST', fd);
    input.value = '';
    titleEl.value = '';
    await renderGaleria();
    showToast('Video agregado');
  } catch(e) {
    showToast('Error al agregar video', true);
  }
}

async function deleteGaleriaItem(itemId, btn) {
  if (!confirm('¿Eliminar este elemento?')) return;
  try {
    await api(`/api/galeria/${itemId}/`, 'DELETE');
    btn.closest('.col-md-4').remove();
    showToast('Eliminado');
  } catch(e) {
    showToast('Error al eliminar', true);
  }
}