// ══════════════════════════════════════════
// STATE
// ══════════════════════════════════════════
const state = {
  currentCatIdx: null,
  editingCatIdx: null,
  editingRowIdx: null,
  editingGame: null,
  addingPlayerTeam: null,
  openAccordions: new Set(),
  dragMode: false,
  categories: [
    { name:'+40',                  img:'assets/+40.jpeg',                   teams:[], jornadas:[], standings:[], players:{}, attendance:{}, attJornadas:{} },
    { name:'3ra Fuerza',           img:'assets/3ra.jpeg',                   teams:[], jornadas:[], standings:[], players:{}, attendance:{}, attJornadas:{} },
    { name:'Categoría A',          img:'assets/catA.jpeg',                  teams:[], jornadas:[], standings:[], players:{}, attendance:{}, attJornadas:{} },
    { name:'Categoría B',          img:'assets/catB.jpeg',                  teams:[], jornadas:[], standings:[], players:{}, attendance:{}, attJornadas:{} },
    { name:'Femenil 3x3',          img:'assets/3x3Fem.jpeg',                teams:[], jornadas:[], standings:[], players:{}, attendance:{}, attJornadas:{} },
    { name:'3x3 "A"',              img:'assets/3x3A.jpeg',   teams:[], jornadas:[], standings:[], players:{}, attendance:{}, attJornadas:{} },
    { name:'3x3 "B"',   img:'assets/3x3B.jpeg',   teams:[], jornadas:[], standings:[], players:{}, attendance:{}, attJornadas:{} },
    { name:'Mixto 3x3',            img:'assets/3x3Mixto.jpeg',              teams:[], jornadas:[], standings:[], players:{}, attendance:{}, attJornadas:{} },
    { name:'3x3 Veteranos',    img:'assets/3x3Vet.jpeg',                teams:[], jornadas:[], standings:[], players:{}, attendance:{}, attJornadas:{} },
    { name:'3x3 Dom. "A"',       img:'assets/3x3DomA.jpeg',               teams:[], jornadas:[], standings:[], players:{}, attendance:{}, attJornadas:{} },
    { name:'3x3 Dom. "B"',       img:'assets/3x3Dominical.jpeg',          teams:[], jornadas:[], standings:[], players:{}, attendance:{}, attJornadas:{} },
    {
      name:'Femenil', img:'assets/Fem5vs5.jpeg',
      teams:['Freskas','Unity','Hashiras','Cuervas','Mustangs'],
      jornadas:[
        { label:'Jornada 1', date:'2025-03-07', games:[
          {local:'Cuervas', visit:'Legends',  sl:54,   sv:20,   time:'18:00'},
          {local:'Freskas', visit:'Furiosas', sl:50,   sv:6,    time:'18:40'},
          {local:'Hashiras',visit:'Unity',    sl:30,   sv:51,   time:'19:20'},
          {local:'Mustangs',visit:'Cuervas',  sl:31,   sv:30,   time:'20:00'},
        ]},
        { label:'Jornada 2', date:'2025-03-14', games:[
          {local:'Unity',  visit:'Freskas',  sl:null, sv:null, time:'18:00'},
          {local:'Cuervas',visit:'Mustangs', sl:null, sv:null, time:'19:00'},
        ]},
        { label:'Jornada 3', date:'2025-03-21', games:[
          {local:'Freskas',visit:'Hashiras', sl:null, sv:null, time:'18:00'},
        ]},
      ],
      standings:[
        {name:'Freskas', jj:13,jg:12,jp:1, pf:639,pc:398,pts:25},
        {name:'Unity',   jj:11,jg:11,jp:0, pf:556,pc:287,pts:22},
        {name:'Hashiras',jj:14,jg:9, jp:5, pf:583,pc:530,pts:23},
        {name:'Cuervas', jj:14,jg:7, jp:7, pf:624,pc:603,pts:21},
        {name:'Mustangs',jj:13,jg:7, jp:6, pf:393,pc:430,pts:20},
      ],
      players:{
        'Freskas': [{num:7, name:'Laura Torres',    pts:145},{num:3, name:'Mariana López',   pts:98}],
        'Unity':   [{num:9, name:'Patricia Sánchez',pts:65}, {num:8, name:'Rosa Díaz',       pts:125},{num:42,name:'Isabel Hernández',pts:118},{num:40,name:'Carmen Rodríguez',pts:103},{num:29,name:'Ana Martínez',pts:136},{num:13,name:'Sofía González',pts:121}],
        'Hashiras':[{num:11,name:'Valeria Cruz',    pts:87}, {num:5, name:'Diana Flores',    pts:72}],
        'Cuervas': [{num:4, name:'Elena Ramírez',   pts:55}],
        'Mustangs':[{num:21,name:'Claudia Vega',    pts:63}],
      },
      attJornadas:{'Freskas':3,'Unity':3,'Hashiras':3,'Cuervas':3,'Mustangs':3},
      attendance:{
        'Unity':   {'Patricia Sánchez':[true,true,false],'Rosa Díaz':[true,false,true],'Isabel Hernández':[false,true,true],'Carmen Rodríguez':[true,true,true],'Ana Martínez':[true,true,false],'Sofía González':[true,false,true]},
        'Freskas': {'Laura Torres':[true,true,true],'Mariana López':[false,true,true]},
        'Hashiras':{'Valeria Cruz':[true,false,null],'Diana Flores':[null,true,true]},
        'Cuervas': {'Elena Ramírez':[true,null,null]},
        'Mustangs':{'Claudia Vega':[null,true,null]},
      }
    }
  ]
};

// ══════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════
const openModal  = id => document.getElementById(id).classList.add('active');
const closeModal = id => document.getElementById(id).classList.remove('active');
const toggleEl   = id => document.getElementById(id).classList.toggle('visible');

let _toastTimer = null;
function toast(msg, color = '#2ecc71') {
  const t = document.getElementById('toast');
  clearTimeout(_toastTimer);
  t.classList.remove('show');
  void t.offsetWidth; // forzar reflow para reiniciar la transición
  t.textContent = msg;
  t.style.background = color;
  t.classList.add('show');
  _toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

// ══════════════════════════════════════════
// CATEGORÍAS
// ══════════════════════════════════════════
function renderCategories() {
  const grid = document.getElementById('categoriesGrid');
  grid.innerHTML = '';
  state.categories.forEach((cat, i) => {
    const card = document.createElement('div');
    card.className = 'cat-card';
    card.innerHTML = `
      <img src="${cat.img}" alt="${cat.name}" loading="lazy">
      <div class="cat-overlay"><span class="cat-name">${cat.name}</span></div>
      <button class="btn-edit-cat" onclick="openEditCat(event,${i})">✏ Editar</button>`;
    card.addEventListener('click', () => openCatModal(i));
    grid.appendChild(card);
  });
  const a = document.createElement('button');
  a.className = 'btn-add-cat';
  a.innerHTML = '<span>＋</span><span>Nueva Categoría</span>';
  a.onclick = addCategory;
  grid.appendChild(a);
}

function openEditCat(e, i) {
  e.stopPropagation();
  state.editingCatIdx = i;
  document.getElementById('editCatName').value = state.categories[i].name;
  openModal('editModal');
}

function saveEditCat() {
  const n = document.getElementById('editCatName').value.trim();
  if (!n) return;
  state.categories[state.editingCatIdx].name = n;
  renderCategories();
  closeModal('editModal');
  toast('Categoría actualizada');
}

function addCategory() {
  const name = prompt('Nombre de la nueva categoría:');
  if (!name) return;
  state.categories.push({
    name, img: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80',
    teams:[], jornadas:[], standings:[], players:{}, attendance:{}, attJornadas:{}
  });
  renderCategories();
  toast('Categoría creada');
}

// ══════════════════════════════════════════
// MODAL + TABS
// ══════════════════════════════════════════
function openCatModal(i) {
  state.currentCatIdx = i;
  state.openAccordions.clear();
  state.dragMode = false;
  document.getElementById('modalCatName').textContent = state.categories[i].name;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelector('[data-tab="jornadas"]').classList.add('active');
  document.getElementById('tab-jornadas').classList.add('active');
  renderJornadas();
  openModal('catModal');
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    const t = btn.dataset.tab;
    if (t === 'tabla')   { state.dragMode = false; renderStandings(); }
    if (t === 'equipos') renderEquipos();
  });
});

// ══════════════════════════════════════════
// JORNADAS
// ══════════════════════════════════════════
function renderJornadas() {
  const cat  = state.categories[state.currentCatIdx];
  const list = document.getElementById('jornadasList');
  list.innerHTML = '';

  cat.jornadas.forEach((jornada, ji) => {
    const block = document.createElement('div');
    block.className = 'jornada-block';

    const gamesHTML = jornada.games.map((g, gi) => {
      const gameDate = g.date ? (() => {
        const d2 = new Date(g.date + 'T00:00');
        return d2.toLocaleDateString('es-MX', { weekday:'short', day:'numeric', month:'short' });
      })() : '';

      if (g.sl !== null && g.sl !== undefined && g.sl !== '') {
        const lW = g.sl > g.sv, vW = g.sv > g.sl;
        return `<div class="game-row">
          <span class="team-name right">${g.local}</span>
          <div class="score-box">
            <span class="score-val ${lW?'win':'lose'}">${g.sl}</span>
            <span class="score-sep">-</span>
            <span class="score-val ${vW?'win':'lose'}">${g.sv}</span>
          </div>
          <span class="team-name">${g.visit}</span>
          <span class="game-time">${gameDate ? gameDate+'<br>' : ''}${g.time} hrs</span>
          <button class="btn-edit-game" onclick="openEditGame(${ji},${gi})" title="Editar partido">✏</button>
        </div>`;
      }
      return `<div class="game-row">
        <span class="team-name right">${g.local}</span>
        <span class="upcoming-badge">vs</span>
        <span class="team-name">${g.visit}</span>
        <span class="game-time">${gameDate ? gameDate+'<br>' : ''}${g.time} hrs</span>
        <button class="btn-edit-game" onclick="openEditGame(${ji},${gi})" title="Editar partido">✏</button>
      </div>`;
    }).join('');

    block.innerHTML = `
      <div class="jornada-header" onclick="this.parentElement.classList.toggle('open')">
        <strong>${jornada.label}</strong>
        <span class="chevron">▾</span>
      </div>
      <div class="jornada-body">
        ${gamesHTML}
        <div style="margin-top:.7rem">
          <button class="btn-sm secondary" style="font-size:.72rem" onclick="toggleEl('addGameJ${ji}')">+ Partido</button>
        </div>
        <div class="collapsible" id="addGameJ${ji}">
          <div class="form-grid">
            <div class="form-group"><label>Local</label><input type="text" id="gj${ji}-l" placeholder="Equipo local" autocomplete="off"/></div>
            <div class="form-group"><label>Visitante</label><input type="text" id="gj${ji}-v" placeholder="Equipo visitante" autocomplete="off"/></div>
            <div class="form-group"><label>Fecha</label><input type="date" id="gj${ji}-d"/></div>
            <div class="form-group"><label>Hora</label><input type="time" id="gj${ji}-t" value="18:00"/></div>
            <div class="form-group"><label>Pts Local <span style="color:#555;font-weight:400">(opcional)</span></label><input type="number" id="gj${ji}-sl" placeholder="—" min="0"/></div>
            <div class="form-group"><label>Pts Visitante <span style="color:#555;font-weight:400">(opcional)</span></label><input type="number" id="gj${ji}-sv" placeholder="—" min="0"/></div>
          </div>
          <p class="score-hint">Sin puntos → aparece como próximo partido.</p>
          <div class="form-actions">
            <button class="btn-sm secondary" onclick="toggleEl('addGameJ${ji}')">Cancelar</button>
            <button class="btn-sm" onclick="saveGameInJornada(${ji})">Guardar</button>
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
  if (!local || !visit || !date) { toast('Completa los datos', '#e74c3c'); return; }
  const sl = slRaw !== '' ? +slRaw : null;
  const sv = svRaw !== '' ? +svRaw : null;
  const n = cat.jornadas.length + 1;
  cat.jornadas.push({ label:`Jornada ${n}`, date, games:[{ local, visit, sl, sv, time, date }] });
  ['fj-local','fj-visit','fj-date','fj-sl','fj-sv'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('addJornadaForm').classList.remove('visible');
  renderJornadas();
  toast('Jornada agregada');
}

function saveGameInJornada(ji) {
  const cat = state.categories[state.currentCatIdx];
  const l   = document.getElementById(`gj${ji}-l`).value.trim();
  const v   = document.getElementById(`gj${ji}-v`).value.trim();
  const t   = document.getElementById(`gj${ji}-t`).value;
  const d   = document.getElementById(`gj${ji}-d`).value;
  const slR = document.getElementById(`gj${ji}-sl`).value;
  const svR = document.getElementById(`gj${ji}-sv`).value;
  if (!l || !v) { toast('Ingresa ambos equipos', '#e74c3c'); return; }
  const sl = slR !== '' ? +slR : null;
  const sv = svR !== '' ? +svR : null;
  cat.jornadas[ji].games.push({ local:l, visit:v, sl, sv, time:t, date:d });
  renderJornadas();
  toast('Partido guardado');
}

function openEditGame(ji, gi) {
  const cat = state.categories[state.currentCatIdx];
  const g   = cat.jornadas[ji].games[gi];
  state.editingGame = { ji, gi };
  document.getElementById('eg-local').value = g.local;
  document.getElementById('eg-visit').value = g.visit;
  document.getElementById('eg-date').value  = g.date || '';
  document.getElementById('eg-time').value  = g.time || '18:00';
  document.getElementById('eg-sl').value    = g.sl !== null && g.sl !== undefined ? g.sl : '';
  document.getElementById('eg-sv').value    = g.sv !== null && g.sv !== undefined ? g.sv : '';
  openModal('editGameModal');
}

function saveGameEdit() {
  const { ji, gi } = state.editingGame;
  const cat = state.categories[state.currentCatIdx];
  const g   = cat.jornadas[ji].games[gi];
  const l   = document.getElementById('eg-local').value.trim();
  const v   = document.getElementById('eg-visit').value.trim();
  if (!l || !v) { toast('Ingresa ambos equipos', '#e74c3c'); return; }
  const slR = document.getElementById('eg-sl').value;
  const svR = document.getElementById('eg-sv').value;
  g.local = l;
  g.visit = v;
  g.date  = document.getElementById('eg-date').value;
  g.time  = document.getElementById('eg-time').value;
  g.sl    = slR !== '' ? +slR : null;
  g.sv    = svR !== '' ? +svR : null;
  closeModal('editGameModal');
  renderJornadas();
  toast('Partido actualizado');
}

// ══════════════════════════════════════════
// TABLA
// ══════════════════════════════════════════
function renderStandings() {
  const cat  = state.categories[state.currentCatIdx];
  const body = document.getElementById('standingsBody');
  const tbl  = document.getElementById('standingsTable');
  body.innerHTML = '';
  tbl.classList.toggle('drag-mode', state.dragMode);
  const btn = document.getElementById('btnDragToggle');
  if (btn) btn.className = 'btn-sm ' + (state.dragMode ? 'drag-active' : 'ghost');

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
      <td style="white-space:nowrap">
        <button class="btn-sm secondary" style="font-size:.7rem;padding:.3rem .6rem" onclick="openEditRow(${i})">✏</button>
        <span class="drag-handle" title="Arrastrar fila">⠿</span>
      </td>`;
    body.appendChild(tr);
  });
}

function toggleDragMode() {
  state.dragMode = !state.dragMode;
  renderStandings();
  toast(state.dragMode ? 'Modo reordenar activado' : 'Modo reordenar desactivado', state.dragMode ? '#ff6b1a' : '#2ecc71');
}

let dragSrcIdx = null;
function dragStart(e) { dragSrcIdx = +e.currentTarget.dataset.idx; e.currentTarget.classList.add('dragging'); }
function dragOver(e)  { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }
function dragEnd(e)   { document.querySelectorAll('.standings-table tr').forEach(r => r.classList.remove('dragging','drag-over')); }
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
  toast('Equipo agregado');
}

function openEditRow(i) {
  state.editingRowIdx = i;
  const t = state.categories[state.currentCatIdx].standings[i];
  ['jj','jg','jp','pf','pc','pts'].forEach(f => document.getElementById(`er-${f}`).value = t[f]);
  openModal('editRowModal');
}

function saveRowEdit() {
  const t = state.categories[state.currentCatIdx].standings[state.editingRowIdx];
  ['jj','jg','jp','pf','pc','pts'].forEach(f => t[f] = +document.getElementById(`er-${f}`).value);
  closeModal('editRowModal');
  renderStandings();
  toast('Estadísticas guardadas');
}

// ══════════════════════════════════════════
// EQUIPOS
// ══════════════════════════════════════════
function addTeamFromEquipos() {
  const name = document.getElementById('eq-team-name').value.trim();
  if (!name) return;
  const cat = state.categories[state.currentCatIdx];
  if (cat.teams.includes(name)) { toast('El equipo ya existe', '#e74c3c'); return; }
  cat.teams.push(name);
  if (!cat.players[name])    cat.players[name]    = [];
  if (!cat.attendance[name]) cat.attendance[name] = {};
  if (!cat.attJornadas[name]) cat.attJornadas[name] = 3;
  if (!cat.standings.find(s => s.name === name)) cat.standings.push({ name, jj:0, jg:0, jp:0, pf:0, pc:0, pts:0 });
  document.getElementById('eq-team-name').value = '';
  document.getElementById('addTeamFormEq').classList.remove('visible');
  state.openAccordions.add(name);
  renderEquipos();
  toast('Equipo agregado');
}

function renderEquipos() {
  const cat       = state.categories[state.currentCatIdx];
  const container = document.getElementById('equiposAccordion');
  container.innerHTML = '';

  if (cat.teams.length === 0) {
    container.innerHTML = `<p style="color:#555;font-size:.85rem;text-align:center;padding:2rem 0">No hay equipos. Agrega uno con el botón de arriba.</p>`;
    return;
  }

  cat.teams.forEach(teamName => {
    const players = cat.players[teamName] || [];
    const att     = cat.attendance[teamName] || {};
    const numJ    = (cat.attJornadas && cat.attJornadas[teamName]) ? cat.attJornadas[teamName] : 3;

    players.forEach(p => {
      if (!att[p.name]) att[p.name] = [];
      while (att[p.name].length < numJ) att[p.name].push(null);
    });
    if (!cat.attendance[teamName]) cat.attendance[teamName] = att;

    let ths = `<th>#&nbsp;&nbsp;Jugador/a</th>`;
    for (let j = 0; j < numJ; j++) ths += `<th>J${j+1}</th>`;
    ths += `<th>Total</th>`;

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
        <td class="ratio-col" data-ratio="${teamName}|${p.name}">${played}/${numJ}</td>
      </tr>`;
    }).join('');

    const isOpen = state.openAccordions.has(teamName);
    const wrapId = 'attWrap_' + teamName.replace(/\s+/g, '_');
    const div    = document.createElement('div');
    div.className   = 'team-accordion' + (isOpen ? ' open' : '');
    div.dataset.team = teamName;
    div.innerHTML = `
      <div class="team-acc-header" onclick="toggleAccordion('${teamName}')">
        <strong>${teamName}</strong>
        <span class="chevron">▾</span>
      </div>
      <div class="team-acc-body">
        <p class="players-label">Asistencias</p>
        <div class="att-scroll-outer">
          <div class="att-wrap" id="${wrapId}">
            <table class="att-table">
              <thead><tr>${ths}</tr></thead>
              <tbody>${trs || '<tr><td colspan="'+(numJ+2)+'" style="color:#555;padding:1rem;text-align:center">Sin jugadores aún</td></tr>'}</tbody>
            </table>
          </div>
          <div class="att-nav">
            <button class="att-nav-btn" onclick="attScroll('${wrapId}',-200)" title="Anterior">◀</button>
            <span class="att-nav-info">← desliza →</span>
            <button class="att-nav-btn" onclick="attScroll('${wrapId}',200)" title="Siguiente">▶</button>
          </div>
        </div>
        <div class="team-actions">
          <button class="btn-ghost-dashed" onclick="openAddPlayer('${teamName}')">＋ Agregar jugador/a</button>
          <button class="btn-ghost-dashed" onclick="addAttendanceCol('${teamName}')">+ Agregar Jornada</button>
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
  const cat = state.categories[state.currentCatIdx];
  if (!cat.attendance[teamName]) cat.attendance[teamName] = {};
  const numJ = (cat.attJornadas && cat.attJornadas[teamName]) || 3;
  if (!cat.attendance[teamName][playerName]) cat.attendance[teamName][playerName] = Array(numJ).fill(null);

  const cur  = cat.attendance[teamName][playerName][ji];
  const next = (cur === true) ? false : true;
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
  const players = cat.players[teamName] || [];
  players.forEach(p => {
    if (!cat.attendance[teamName][p.name]) cat.attendance[teamName][p.name] = [];
    cat.attendance[teamName][p.name].push(null);
  });
  state.openAccordions.add(teamName);
  renderEquipos();
  toast('Jornada agregada');
}

function openAddPlayer(teamName) {
  state.addingPlayerTeam = teamName;
  document.getElementById('addPlayerTitle').textContent = `Agregar jugador/a — ${teamName}`;
  document.getElementById('ap-name').value = '';
  document.getElementById('ap-num').value  = '';
  openModal('addPlayerModal');
}

function savePlayer() {
  const name = document.getElementById('ap-name').value.trim();
  const num  = document.getElementById('ap-num').value.trim();
  if (!name) return;
  const cat  = state.categories[state.currentCatIdx];
  const team = state.addingPlayerTeam;
  if (!cat.players[team]) cat.players[team] = [];
  cat.players[team].push({ num, name, pts: 0 });
  if (!cat.attendance[team]) cat.attendance[team] = {};
  const n = (cat.attJornadas && cat.attJornadas[team]) || 3;
  cat.attendance[team][name] = Array(n).fill(null);
  closeModal('addPlayerModal');
  state.openAccordions.add(team);
  renderEquipos();
  toast('Jugador/a agregado/a');
}

// ══════════════════════════════════════════
// GALLERY
// ══════════════════════════════════════════
function addGalleryPhoto(e) {
  const file = e.target.files[0];
  if (!file) return;
  const url  = URL.createObjectURL(file);
  const grid = document.getElementById('galleryGrid');
  const item = document.createElement('div');
  item.className = 'gallery-item';
  item.innerHTML = `<img src="${url}" alt="foto">`;
  grid.insertBefore(item, grid.firstChild);
  toast('Foto agregada');
}

// ══════════════════════════════════════════
// INIT
// ══════════════════════════════════════════
renderCategories();
document.querySelectorAll('.modal-overlay').forEach(ov => {
  ov.addEventListener('click', e => { if (e.target === ov) ov.classList.remove('active'); });
});