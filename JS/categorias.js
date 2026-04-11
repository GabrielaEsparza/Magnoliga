// ══════════════════════════════════════════
// categorias.js  —  Magnoliga
// Usa Bootstrap Modal API igual que depoturismo.js
// ══════════════════════════════════════════

// ── STATE ──────────────────────────────────
const state = {
  currentCatIdx:    null,
  editingCatIdx:    null,
  editingRowIdx:    null,
  editingGame:      null,   // { ji, gi }
  addingPlayerTeam: null,
  openAccordions:   new Set(),
  dragMode:         false,

  categories: [
    { name:'+40',           img:'./assets/+40.jpeg',          teams:[], jornadas:[], standings:[], players:{}, attendance:{}, attJornadas:{} },
    { name:'3ra Fuerza',    img:'./assets/3ra.jpeg',          teams:[], jornadas:[], standings:[], players:{}, attendance:{}, attJornadas:{} },
    { name:'Categoría A',   img:'./assets/catA.jpeg',         teams:[], jornadas:[], standings:[], players:{}, attendance:{}, attJornadas:{} },
    { name:'Categoría B',   img:'./assets/catB.jpeg',         teams:[], jornadas:[], standings:[], players:{}, attendance:{}, attJornadas:{} },
    { name:'Femenil 3x3',   img:'./assets/3x3Fem.jpeg',       teams:[], jornadas:[], standings:[], players:{}, attendance:{}, attJornadas:{} },
    { name:'3x3 "A"',       img:'./assets/3x3A.jpeg',         teams:[], jornadas:[], standings:[], players:{}, attendance:{}, attJornadas:{} },
    { name:'3x3 "B"',       img:'./assets/3x3B.jpeg',         teams:[], jornadas:[], standings:[], players:{}, attendance:{}, attJornadas:{} },
    { name:'Mixto 3x3',     img:'./assets/3x3Mixto.jpeg',     teams:[], jornadas:[], standings:[], players:{}, attendance:{}, attJornadas:{} },
    { name:'3x3 Veteranos', img:'./assets/3x3Vet.jpeg',       teams:[], jornadas:[], standings:[], players:{}, attendance:{}, attJornadas:{} },
    { name:'3x3 Dom. "A"',  img:'./assets/3x3DomA.jpeg',      teams:[], jornadas:[], standings:[], players:{}, attendance:{}, attJornadas:{} },
    { name:'3x3 Dom. "B"',  img:'./assets/3x3Dominical.jpeg', teams:[], jornadas:[], standings:[], players:{}, attendance:{}, attJornadas:{} },
    {
      name: 'Femenil',
      img:  './assets/Fem5vs5.jpeg',
      teams: ['Freskas','Unity','Hashiras','Cuervas','Mustangs'],
      jornadas: [
        { label:'Jornada 1', date:'2025-03-07', games: [
          { local:'Cuervas',  visit:'Legends',  sl:54,   sv:20,   time:'18:00', date:'2025-03-07' },
          { local:'Freskas',  visit:'Furiosas', sl:50,   sv:6,    time:'18:40', date:'2025-03-07' },
          { local:'Hashiras', visit:'Unity',    sl:30,   sv:51,   time:'19:20', date:'2025-03-07' },
          { local:'Mustangs', visit:'Cuervas',  sl:31,   sv:30,   time:'20:00', date:'2025-03-07' },
        ]},
        { label:'Jornada 2', date:'2025-03-14', games: [
          { local:'Unity',   visit:'Freskas',  sl:null, sv:null, time:'18:00', date:'2025-03-14' },
          { local:'Cuervas', visit:'Mustangs', sl:null, sv:null, time:'19:00', date:'2025-03-14' },
        ]},
        { label:'Jornada 3', date:'2025-03-21', games: [
          { local:'Freskas', visit:'Hashiras', sl:null, sv:null, time:'18:00', date:'2025-03-21' },
        ]},
      ],
      standings: [
        { name:'Freskas',  jj:13, jg:12, jp:1,  pf:639, pc:398, pts:25 },
        { name:'Unity',    jj:11, jg:11, jp:0,  pf:556, pc:287, pts:22 },
        { name:'Hashiras', jj:14, jg:9,  jp:5,  pf:583, pc:530, pts:23 },
        { name:'Cuervas',  jj:14, jg:7,  jp:7,  pf:624, pc:603, pts:21 },
        { name:'Mustangs', jj:13, jg:7,  jp:6,  pf:393, pc:430, pts:20 },
      ],
      players: {
        'Freskas':  [{ num:'7',  name:'Laura Torres',     pts:0 }, { num:'3',  name:'Mariana López',    pts:0 }],
        'Unity':    [{ num:'9',  name:'Patricia Sánchez', pts:0 }, { num:'8',  name:'Rosa Díaz',        pts:0 },
                     { num:'42', name:'Isabel Hernández', pts:0 }, { num:'40', name:'Carmen Rodríguez', pts:0 },
                     { num:'29', name:'Ana Martínez',     pts:0 }, { num:'13', name:'Sofía González',   pts:0 }],
        'Hashiras': [{ num:'11', name:'Valeria Cruz',     pts:0 }, { num:'5',  name:'Diana Flores',     pts:0 }],
        'Cuervas':  [{ num:'4',  name:'Elena Ramírez',    pts:0 }],
        'Mustangs': [{ num:'21', name:'Claudia Vega',     pts:0 }],
      },
      attJornadas: { 'Freskas':3, 'Unity':3, 'Hashiras':3, 'Cuervas':3, 'Mustangs':3 },
      attendance: {
        'Unity':    { 'Patricia Sánchez':[true,true,false], 'Rosa Díaz':[true,false,true], 'Isabel Hernández':[false,true,true], 'Carmen Rodríguez':[true,true,true], 'Ana Martínez':[true,true,false], 'Sofía González':[true,false,true] },
        'Freskas':  { 'Laura Torres':[true,true,true],  'Mariana López':[false,true,true] },
        'Hashiras': { 'Valeria Cruz':[true,false,null], 'Diana Flores':[null,true,true]  },
        'Cuervas':  { 'Elena Ramírez':[true,null,null] },
        'Mustangs': { 'Claudia Vega':[null,true,null]  },
      }
    }
  ]
};

// ── BOOTSTRAP MODAL INSTANCES ──────────────
let bsCatModal, bsEditModal, bsEditRowModal, bsAddPlayerModal, bsEditGameModal;

document.addEventListener('DOMContentLoaded', () => {
  bsCatModal       = new bootstrap.Modal(document.getElementById('catModal'));
  bsEditModal      = new bootstrap.Modal(document.getElementById('editModal'));
  bsEditRowModal   = new bootstrap.Modal(document.getElementById('editRowModal'));
  bsAddPlayerModal = new bootstrap.Modal(document.getElementById('addPlayerModal'));
  bsEditGameModal  = new bootstrap.Modal(document.getElementById('editGameModal'));

  // Tab buttons inside the category modal
  document.querySelectorAll('.modal-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane-cat').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
      const t = btn.dataset.tab;
      if (t === 'tabla')   { state.dragMode = false; renderStandings(); }
      if (t === 'equipos') renderEquipos();
    });
  });

  // Reset tabs when category modal closes
  document.getElementById('catModal').addEventListener('hidden.bs.modal', () => {
    state.openAccordions.clear();
    state.dragMode = false;
    resetTabs();
  });

  renderCategories();
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

// ── CATEGORÍAS ─────────────────────────────
function renderCategories() {
  const grid = document.getElementById('categoriesGrid');
  grid.innerHTML = '';

  state.categories.forEach((cat, i) => {
    const col  = document.createElement('div');
    col.className = 'col-6 col-sm-4 col-lg-3';
    col.innerHTML = `
      <div class="cat-card" onclick="openCatModal(${i})">
        <img src="${cat.img}" alt="${cat.name}" loading="lazy">
        <div class="cat-overlay"><span class="cat-name">${cat.name}</span></div>
        <button class="btn-edit-cat" onclick="openEditCat(event,${i})">✏ Editar</button>
      </div>`;
    grid.appendChild(col);
  });

  // Add new category button
  const addCol = document.createElement('div');
  addCol.className = 'col-6 col-sm-4 col-lg-3';
  addCol.innerHTML = `
    <button class="btn-add-cat" onclick="addCategory()">
      <span class="add-icon">＋</span>
      <span>Nueva Categoría</span>
    </button>`;
  grid.appendChild(addCol);
}

function openCatModal(i) {
  state.currentCatIdx = i;
  state.openAccordions.clear();
  state.dragMode = false;
  document.getElementById('modalCatName').textContent = state.categories[i].name;
  resetTabs();
  // Clear any open collapsibles
  document.querySelectorAll('.cat-collapsible.visible').forEach(el => el.classList.remove('visible'));
  renderJornadas();
  bsCatModal.show();
}

function openEditCat(e, i) {
  e.stopPropagation();
  state.editingCatIdx = i;
  document.getElementById('editCatName').value = state.categories[i].name;
  bsEditModal.show();
}
function saveEditCat() {
  const n = document.getElementById('editCatName').value.trim();
  if (!n) return;
  state.categories[state.editingCatIdx].name = n;
  renderCategories();
  bsEditModal.hide();
  showToast('Categoría actualizada');
}
function addCategory() {
  const name = prompt('Nombre de la nueva categoría:');
  if (!name) return;
  state.categories.push({
    name, img:'./assets/magnoliga-categorias.jpg',
    teams:[], jornadas:[], standings:[], players:{}, attendance:{}, attJornadas:{}
  });
  renderCategories();
  showToast('Categoría creada');
}

// ── JORNADAS ───────────────────────────────
function renderJornadas() {
  const cat  = state.categories[state.currentCatIdx];
  const list = document.getElementById('jornadasList');
  list.innerHTML = '';

  cat.jornadas.forEach((jornada, ji) => {
    const block = document.createElement('div');
    block.className = 'jornada-block';

    const gamesHTML = jornada.games.map((g, gi) => {
      const dateFmt = g.date ? new Date(g.date + 'T00:00').toLocaleDateString('es-MX', { weekday:'short', day:'numeric', month:'short' }) : '';
      const editBtn = `<button class="btn-edit-game" onclick="openEditGame(${ji},${gi})">✏</button>`;

      if (g.sl !== null && g.sl !== undefined && g.sl !== '') {
        const lW = g.sl > g.sv, vW = g.sv > g.sl;
        return `<div class="game-row">
          <span class="game-team right">${g.local}</span>
          <div class="score-box">
            <span class="score-val ${lW?'win':'lose'}">${g.sl}</span>
            <span class="score-sep">-</span>
            <span class="score-val ${vW?'win':'lose'}">${g.sv}</span>
          </div>
          <span class="game-team">${g.visit}</span>
          <span class="game-time-badge">${dateFmt ? dateFmt+'<br>' : ''}${g.time} hrs</span>
          ${editBtn}
        </div>`;
      }
      return `<div class="game-row">
        <span class="game-team right">${g.local}</span>
        <span class="upcoming-vs">vs</span>
        <span class="game-team">${g.visit}</span>
        <span class="game-time-badge">${dateFmt ? dateFmt+'<br>' : ''}${g.time} hrs</span>
        ${editBtn}
      </div>`;
    }).join('');

    block.innerHTML = `
      <div class="jornada-header" onclick="this.parentElement.classList.toggle('open')">
        <strong>${jornada.label}</strong>
        <span class="cat-chevron"><i class="bi bi-chevron-down"></i></span>
      </div>
      <div class="jornada-body">
        ${gamesHTML}
        <div class="mt-2">
          <button class="btn btn-outline-secondary btn-sm" onclick="toggleEl('addGameJ${ji}')">+ Partido</button>
        </div>
        <div class="cat-collapsible mt-2" id="addGameJ${ji}">
          <div class="row g-2">
            <div class="col-md-6"><label class="form-label text-secondary small">Local</label><input type="text" class="form-control bg-input border-0 text-white" id="gj${ji}-l" placeholder="Equipo local" autocomplete="off"></div>
            <div class="col-md-6"><label class="form-label text-secondary small">Visitante</label><input type="text" class="form-control bg-input border-0 text-white" id="gj${ji}-v" placeholder="Equipo visitante" autocomplete="off"></div>
            <div class="col-md-6"><label class="form-label text-secondary small">Fecha</label><input type="date" class="form-control bg-input border-0 text-white" id="gj${ji}-d"></div>
            <div class="col-md-6"><label class="form-label text-secondary small">Hora</label><input type="time" class="form-control bg-input border-0 text-white" id="gj${ji}-t" value="18:00"></div>
            <div class="col-md-6"><label class="form-label text-secondary small">Pts Local <span class="text-muted">(opc.)</span></label><input type="number" class="form-control bg-input border-0 text-white" id="gj${ji}-sl" placeholder="—" min="0"></div>
            <div class="col-md-6"><label class="form-label text-secondary small">Pts Visitante <span class="text-muted">(opc.)</span></label><input type="number" class="form-control bg-input border-0 text-white" id="gj${ji}-sv" placeholder="—" min="0"></div>
          </div>
          <p class="text-muted small mt-2 mb-0"><i class="bi bi-info-circle me-1"></i>Sin puntos → aparece como próximo partido.</p>
          <div class="d-flex gap-2 justify-content-end mt-2">
            <button class="btn btn-secondary btn-sm" onclick="toggleEl('addGameJ${ji}')">Cancelar</button>
            <button class="btn btn-orange btn-sm fw-semibold" onclick="saveGameInJornada(${ji})">Guardar</button>
          </div>
        </div>
      </div>`;
    if (ji === 0) block.classList.add('open');
    list.appendChild(block);
  });
}

function saveGame() {
  const cat   = state.categories[state.currentCatIdx];
  const local = document.getElementById('fj-local').value.trim();
  const visit = document.getElementById('fj-visit').value.trim();
  const date  = document.getElementById('fj-date').value;
  const time  = document.getElementById('fj-time').value;
  const slRaw = document.getElementById('fj-sl').value;
  const svRaw = document.getElementById('fj-sv').value;
  if (!local || !visit || !date) { showToast('Completa los datos', true); return; }
  const sl = slRaw !== '' ? +slRaw : null;
  const sv = svRaw !== '' ? +svRaw : null;
  const n  = cat.jornadas.length + 1;
  cat.jornadas.push({ label:`Jornada ${n}`, date, games:[{ local, visit, sl, sv, time, date }] });
  ['fj-local','fj-visit','fj-date','fj-sl','fj-sv'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('addJornadaForm').classList.remove('visible');
  renderJornadas();
  showToast('Jornada agregada');
}

function saveGameInJornada(ji) {
  const cat = state.categories[state.currentCatIdx];
  const l   = document.getElementById(`gj${ji}-l`).value.trim();
  const v   = document.getElementById(`gj${ji}-v`).value.trim();
  const d   = document.getElementById(`gj${ji}-d`).value;
  const t   = document.getElementById(`gj${ji}-t`).value;
  const slR = document.getElementById(`gj${ji}-sl`).value;
  const svR = document.getElementById(`gj${ji}-sv`).value;
  if (!l || !v) { showToast('Ingresa ambos equipos', true); return; }
  const sl = slR !== '' ? +slR : null;
  const sv = svR !== '' ? +svR : null;
  cat.jornadas[ji].games.push({ local:l, visit:v, sl, sv, time:t, date:d });
  renderJornadas();
  showToast('Partido guardado');
}

function openEditGame(ji, gi) {
  const g = state.categories[state.currentCatIdx].jornadas[ji].games[gi];
  state.editingGame = { ji, gi };
  document.getElementById('eg-local').value = g.local;
  document.getElementById('eg-visit').value = g.visit;
  document.getElementById('eg-date').value  = g.date  || '';
  document.getElementById('eg-time').value  = g.time  || '18:00';
  document.getElementById('eg-sl').value    = (g.sl != null) ? g.sl : '';
  document.getElementById('eg-sv').value    = (g.sv != null) ? g.sv : '';
  bsEditGameModal.show();
}
function saveGameEdit() {
  const { ji, gi } = state.editingGame;
  const g   = state.categories[state.currentCatIdx].jornadas[ji].games[gi];
  const l   = document.getElementById('eg-local').value.trim();
  const v   = document.getElementById('eg-visit').value.trim();
  if (!l || !v) { showToast('Ingresa ambos equipos', true); return; }
  const slR = document.getElementById('eg-sl').value;
  const svR = document.getElementById('eg-sv').value;
  g.local = l; g.visit = v;
  g.date  = document.getElementById('eg-date').value;
  g.time  = document.getElementById('eg-time').value;
  g.sl    = slR !== '' ? +slR : null;
  g.sv    = svR !== '' ? +svR : null;
  bsEditGameModal.hide();
  renderJornadas();
  showToast('Partido actualizado');
}

// ── TABLA ──────────────────────────────────
function renderStandings() {
  const cat  = state.categories[state.currentCatIdx];
  const body = document.getElementById('standingsBody');
  const tbl  = document.getElementById('standingsTable');
  body.innerHTML = '';
  tbl.classList.toggle('drag-mode', state.dragMode);
  const btn = document.getElementById('btnDragToggle');
  if (btn) {
    btn.classList.toggle('drag-active', state.dragMode);
    btn.textContent = state.dragMode ? '⠿ Reordenando…' : '⠿ Reordenar';
  }
  cat.standings.forEach((t, i) => {
    const dif = t.pf - t.pc;
    const tr  = document.createElement('tr');
    tr.dataset.idx = i;
    if (state.dragMode) {
      tr.draggable = true;
      tr.classList.add('drag-enabled');
      tr.addEventListener('dragstart', dragStart);
      tr.addEventListener('dragover',  dragOver);
      tr.addEventListener('drop',      dropRow);
      tr.addEventListener('dragend',   dragEnd);
    }
    tr.innerHTML = `
      <td><span class="pos-num">${i+1}</span></td>
      <td>${t.name}</td>
      <td class="val-gray">${t.jj}</td>
      <td class="val-green">${t.jg}</td>
      <td class="val-red">${t.jp}</td>
      <td>${t.pf}</td><td>${t.pc}</td>
      <td class="${dif>=0?'val-green':'val-red'}">${dif>0?'+':''}${dif}</td>
      <td><span class="pts-badge">${t.pts}</span></td>
      <td class="text-nowrap">
        <button class="btn btn-sm btn-secondary py-0 px-2" style="font-size:.7rem" onclick="openEditRow(${i})"><i class="bi bi-pencil"></i></button>
        <span class="drag-handle ms-1">⠿</span>
      </td>`;
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
function dropRow(e) {
  e.preventDefault();
  const dest = +e.currentTarget.dataset.idx;
  if (dragSrcIdx === null || dragSrcIdx === dest) return;
  const cat = state.categories[state.currentCatIdx];
  const [m] = cat.standings.splice(dragSrcIdx, 1);
  cat.standings.splice(dest, 0, m);
  renderStandings();
  dragSrcIdx = null;
}

function addTeamToStandings() {
  const name = document.getElementById('ft-name').value.trim();
  if (!name) return;
  const cat = state.categories[state.currentCatIdx];
  cat.standings.push({ name, jj:0, jg:0, jp:0, pf:0, pc:0, pts:0 });
  if (!cat.teams.includes(name)) cat.teams.push(name);
  document.getElementById('ft-name').value = '';
  document.getElementById('addTeamForm').classList.remove('visible');
  renderStandings();
  showToast('Equipo agregado');
}
function openEditRow(i) {
  state.editingRowIdx = i;
  const t = state.categories[state.currentCatIdx].standings[i];
  ['jj','jg','jp','pf','pc','pts'].forEach(f => document.getElementById(`er-${f}`).value = t[f]);
  bsEditRowModal.show();
}
function saveRowEdit() {
  const t = state.categories[state.currentCatIdx].standings[state.editingRowIdx];
  ['jj','jg','jp','pf','pc','pts'].forEach(f => t[f] = +document.getElementById(`er-${f}`).value);
  bsEditRowModal.hide();
  renderStandings();
  showToast('Estadísticas guardadas');
}

// ── EQUIPOS ────────────────────────────────
function addTeamFromEquipos() {
  const name = document.getElementById('eq-team-name').value.trim();
  if (!name) return;
  const cat = state.categories[state.currentCatIdx];
  if (cat.teams.includes(name)) { showToast('El equipo ya existe', true); return; }
  cat.teams.push(name);
  if (!cat.players[name])     cat.players[name]     = [];
  if (!cat.attendance[name])  cat.attendance[name]  = {};
  if (!cat.attJornadas[name]) cat.attJornadas[name] = 3;
  if (!cat.standings.find(s => s.name === name)) cat.standings.push({ name, jj:0, jg:0, jp:0, pf:0, pc:0, pts:0 });
  document.getElementById('eq-team-name').value = '';
  document.getElementById('addTeamFormEq').classList.remove('visible');
  state.openAccordions.add(name);
  renderEquipos();
  showToast('Equipo agregado');
}

function renderEquipos() {
  const cat       = state.categories[state.currentCatIdx];
  const container = document.getElementById('equiposAccordion');
  container.innerHTML = '';

  if (cat.teams.length === 0) {
    container.innerHTML = `<p class="text-secondary small text-center py-4">No hay equipos. Agrega uno con el botón de arriba.</p>`;
    return;
  }

  cat.teams.forEach(teamName => {
    const players = cat.players[teamName]    || [];
    const att     = cat.attendance[teamName] || {};
    const numJ    = (cat.attJornadas && cat.attJornadas[teamName]) ? cat.attJornadas[teamName] : 3;

    players.forEach(p => {
      if (!att[p.name]) att[p.name] = [];
      while (att[p.name].length < numJ) att[p.name].push(null);
    });
    if (!cat.attendance[teamName]) cat.attendance[teamName] = att;

    // Header row
    let ths = `<th>#&nbsp; Jugador/a</th>`;
    for (let j = 0; j < numJ; j++) ths += `<th>J${j+1}</th>`;
    ths += `<th>Total</th>`;

    // Player rows
    const trs = players.map(p => {
      const row    = att[p.name] || [];
      const played = row.filter(v => v === true).length;
      let cells = '';
      for (let j = 0; j < numJ; j++) {
        const v   = row[j];
        const cls = v === true ? 'present' : v === false ? 'absent' : 'empty';
        const ico = v === true ? '✓' : v === false ? '✗' : '·';
        cells += `<td><button class="att-cell ${cls}" data-team="${teamName}" data-player="${p.name}" data-ji="${j}" onclick="toggleAtt(this)">${ico}</button></td>`;
      }
      return `<tr>
        <td data-player-name="${p.name}" data-team="${teamName}">#${p.num}&nbsp; ${p.name} <span class="ratio-badge">(${played}/${numJ})</span></td>
        ${cells}
        <td data-ratio="${teamName}|${p.name}">${played}/${numJ}</td>
      </tr>`;
    }).join('');

    const isOpen = state.openAccordions.has(teamName);
    const wrapId = 'attWrap_' + teamName.replace(/[^a-zA-Z0-9]/g,'_');
    const div    = document.createElement('div');
    div.className    = 'team-accordion' + (isOpen ? ' open' : '');
    div.dataset.team = teamName;
    div.innerHTML = `
      <div class="team-acc-header" onclick="toggleAccordion('${teamName}')">
        <strong>${teamName}</strong>
        <i class="bi bi-chevron-down cat-chevron"></i>
      </div>
      <div class="team-acc-body">
        <p class="att-section-label">Asistencias</p>
        <div class="att-scroll-outer">
          <div class="att-wrap" id="${wrapId}">
            <table class="att-table">
              <thead><tr>${ths}</tr></thead>
              <tbody>${trs || `<tr><td colspan="${numJ+2}" class="text-secondary text-center py-3 small">Sin jugadores aún</td></tr>`}</tbody>
            </table>
          </div>
          <div class="att-nav">
            <button class="att-nav-btn" onclick="attScroll('${wrapId}',-180)"><i class="bi bi-chevron-left"></i></button>
            <span class="att-nav-info">← desliza →</span>
            <button class="att-nav-btn" onclick="attScroll('${wrapId}',180)"><i class="bi bi-chevron-right"></i></button>
          </div>
        </div>
        <div class="d-flex gap-2 flex-wrap mt-3">
          <button class="btn-ghost-dashed" onclick="openAddPlayer('${teamName}')"><i class="bi bi-person-plus me-1"></i>Agregar jugador/a</button>
          <button class="btn-ghost-dashed" onclick="addAttendanceCol('${teamName}')"><i class="bi bi-plus me-1"></i>Agregar Jornada</button>
        </div>
      </div>`;
    container.appendChild(div);
  });
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
function toggleAtt(btn) {
  const teamName   = btn.dataset.team;
  const playerName = btn.dataset.player;
  const ji         = +btn.dataset.ji;
  const cat        = state.categories[state.currentCatIdx];
  if (!cat.attendance[teamName]) cat.attendance[teamName] = {};
  const numJ = (cat.attJornadas && cat.attJornadas[teamName]) || 3;
  if (!cat.attendance[teamName][playerName]) cat.attendance[teamName][playerName] = Array(numJ).fill(null);
  const cur  = cat.attendance[teamName][playerName][ji];
  const next = cur === true ? false : true;
  cat.attendance[teamName][playerName][ji] = next;
  btn.className   = 'att-cell ' + (next === true ? 'present' : next === false ? 'absent' : 'empty');
  btn.textContent = next === true ? '✓' : next === false ? '✗' : '·';
  const row    = cat.attendance[teamName][playerName];
  const played = row.filter(v => v === true).length;
  const total  = cat.attJornadas[teamName] || 3;
  const nameTd = btn.closest('table').querySelector(`td[data-player-name="${playerName}"][data-team="${teamName}"]`);
  if (nameTd) {
    const pl = cat.players[teamName]?.find(p => p.name === playerName);
    if (pl) nameTd.innerHTML = `#${pl.num}&nbsp; ${pl.name} <span class="ratio-badge">(${played}/${total})</span>`;
  }
  const ratioTd = btn.closest('table').querySelector(`td[data-ratio="${teamName}|${playerName}"]`);
  if (ratioTd) ratioTd.textContent = `${played}/${total}`;
}
function addAttendanceCol(teamName) {
  const cat = state.categories[state.currentCatIdx];
  if (!cat.attJornadas) cat.attJornadas = {};
  cat.attJornadas[teamName] = ((cat.attJornadas[teamName]) || 3) + 1;
  if (!cat.attendance[teamName]) cat.attendance[teamName] = {};
  (cat.players[teamName] || []).forEach(p => {
    if (!cat.attendance[teamName][p.name]) cat.attendance[teamName][p.name] = [];
    cat.attendance[teamName][p.name].push(null);
  });
  state.openAccordions.add(teamName);
  renderEquipos();
  showToast('Jornada agregada');
}
function openAddPlayer(teamName) {
  state.addingPlayerTeam = teamName;
  document.getElementById('addPlayerTitle').textContent = `Agregar jugador/a — ${teamName}`;
  document.getElementById('ap-name').value = '';
  document.getElementById('ap-num').value  = '';
  bsAddPlayerModal.show();
}
function savePlayer() {
  const name = document.getElementById('ap-name').value.trim();
  const num  = document.getElementById('ap-num').value.trim();
  if (!name) return;
  const cat  = state.categories[state.currentCatIdx];
  const team = state.addingPlayerTeam;
  if (!cat.players[team]) cat.players[team] = [];
  cat.players[team].push({ num, name, pts:0 });
  if (!cat.attendance[team]) cat.attendance[team] = {};
  const n = (cat.attJornadas && cat.attJornadas[team]) || 3;
  cat.attendance[team][name] = Array(n).fill(null);
  bsAddPlayerModal.hide();
  state.openAccordions.add(team);
  renderEquipos();
  showToast('Jugador/a agregado/a');
}

// ── GALLERY ────────────────────────────────
function addGalleryPhoto(e) {
  const file = e.target.files[0];
  if (!file) return;
  const url  = URL.createObjectURL(file);
  const grid = document.getElementById('galleryGrid');
  const col  = document.createElement('div');
  col.className = 'col-md-4';
  col.innerHTML = `
    <div class="gallery-img-card">
      <img src="${url}" alt="foto">
      <button class="gallery-img-remove" onclick="this.closest('.col-md-4').remove()"><i class="bi bi-x"></i></button>
    </div>`;
  grid.insertBefore(col, grid.firstChild);
  showToast('Foto agregada');
}