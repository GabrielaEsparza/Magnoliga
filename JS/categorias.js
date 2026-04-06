/**
 * ============================================================
 * categorias.js — Magnoliga · Gestión de Categorías
 * ============================================================
 * Cada tarjeta de categoría abre un modal fullscreen con:
 *  - Jornadas y partidos (agregar / editar / eliminar)
 *  - Tabla de posiciones (editable + drag & drop)
 *  - Equipos + jugadores + asistencia por jornada (scroll horizontal)
 *  - Galería con fotos (archivo) y videos (URL o YouTube)
 *
 * Datos persistidos en localStorage (clave única por categoría).
 * ============================================================
 */
 
/* ══ UTILIDADES ═════════════════════════════════════════════ */
 
function uid() { return Math.random().toString(36).slice(2, 9); }
 
function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}
 
function toast(msg, type = '') {
  const box = document.getElementById('tbox');
  if (!box) return;
  const t = document.createElement('div');
  t.className = `toast-msg ${type}`;
  t.textContent = msg;
  box.appendChild(t);
  setTimeout(() => t.remove(), 2800);
}
 
function getYouTubeId(url) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}
 
/* ══ ESTADO GLOBAL ══════════════════════════════════════════ */
let currentCatKey  = null;
let currentCatName = '';
let S = {};
 
/* ══ PERSISTENCIA ══════════════════════════════════════════ */
function loadCat(key) {
  try { const r = localStorage.getItem(key); if (r) return JSON.parse(r); } catch(e) {}
  return null;
}
function saveCat() {
  if (!currentCatKey) return;
  localStorage.setItem(currentCatKey, JSON.stringify(S));
}
 
function buildDefaultState(nombre) {
  return { nombre, jornadas: [], tabla: [], equipos: [], media: [] };
}
 
/* ══ APERTURA / CIERRE DEL MODAL ═══════════════════════════ */
 
/**
 * Abre el modal de gestión para una categoría.
 * @param {string} key    - clave localStorage única
 * @param {string} nombre - nombre visible
 */
function openCatModal(key, nombre) {
  currentCatKey  = key;
  currentCatName = nombre;
  const saved = loadCat(key);
  S = saved || buildDefaultState(nombre);
  if (!S.media)   S.media   = [];
  if (!S.tabla)   S.tabla   = [];
  if (!S.equipos) S.equipos = [];
 
  syncTablaFromGames();
  saveCat();
 
  document.getElementById('catModalTitle').textContent = nombre;
  document.getElementById('catModalSub').textContent   = 'Categoría activa · Temporada en curso';
  document.getElementById('catModalBack').classList.add('open');
 
  // Activar primera pestaña
  const firstBtn = document.querySelector('.cat-tab-list button');
  if (firstBtn) switchCatTab('jornadas', firstBtn);
 
  document.body.style.overflow = 'hidden';
}
 
function closeCatModal() {
  document.getElementById('catModalBack').classList.remove('open');
  document.body.style.overflow = '';
  currentCatKey = null;
}
 
/* ══ TABS ══════════════════════════════════════════════════ */
function switchCatTab(tab, btn) {
  document.querySelectorAll('.cat-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.cat-tab-list button').forEach(b => b.classList.remove('active'));
  document.getElementById('catPanel-' + tab).classList.add('active');
  if (btn) btn.classList.add('active');
  if (tab === 'jornadas') renderJornadas();
  if (tab === 'tabla')    renderTabla();
  if (tab === 'equipos')  renderEquipos();
  if (tab === 'galeria')  renderGaleria();
}
 
/* ══════════════════════════════════════════════════════════
   JORNADAS
   ══════════════════════════════════════════════════════════ */
function renderJornadas() {
  const c = document.getElementById('jornadasContainer');
  if (!S.jornadas.length) {
    c.innerHTML = '<p style="color:var(--dim);text-align:center;padding:36px">Sin jornadas aún.</p>';
    return;
  }
  c.innerHTML = S.jornadas.map(j => jornHTML(j)).join('');
}
 
function jornHTML(j) {
  return `
  <div class="jorn-item${j.open ? ' open' : ''}" id="ji-${j.id}">
    <div class="jorn-hd" onclick="toggleJorn('${j.id}')">
      <div style="display:flex;align-items:center">
        <span class="jorn-num">${j.nombre}</span>
        <span class="jorn-dl">${j.fechaLabel || fmtDate(j.fecha) || ''}</span>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:11px;color:var(--dim)">${j.games.length} partido${j.games.length !== 1 ? 's' : ''}</span>
        <span class="chevron">▾</span>
      </div>
    </div>
    <div class="jorn-body">
      ${j.games.map(g => gameHTML(j.id, g)).join('')}
      <button class="add-game-btn" onclick="openAddGame('${j.id}')">＋ Agregar partido</button>
      <div class="jorn-foot">
        <button class="btn sm" onclick="openEditJorn('${j.id}')">✏️ Editar</button>
        <button class="btn sm danger" onclick="conf('Eliminar jornada','Se borrarán todos sus partidos.',()=>deleteJorn('${j.id}'))">🗑 Eliminar</button>
      </div>
    </div>
  </div>`;
}
 
function gameHTML(jid, g) {
  if (g.modo === 'finalizado') {
    const aw = g.pA > g.pB;
    return `<div class="game-row">
      <div class="g-team">${g.eA}</div>
      <div class="score-blk">
        <span class="sv ${aw ? 'w' : 'l'}">${g.pA}</span>
        <span class="ss">-</span>
        <span class="sv ${!aw ? 'w' : 'l'}">${g.pB}</span>
      </div>
      <div class="g-team r">${g.eB}</div>
      <div class="g-actions">
        <button class="ibtn" onclick="openEditGame('${jid}','${g.id}')">✏️</button>
        <button class="ibtn d" onclick="conf('Eliminar partido','',()=>deleteGame('${jid}','${g.id}'))">🗑</button>
      </div>
    </div>`;
  }
  return `<div class="game-row">
    <div class="g-team">${g.eA}</div>
    <div class="time-blk">🕐 ${fmtDate(g.fecha) || '—'} ${g.hora || ''}</div>
    <div class="g-team r">${g.eB}</div>
    <div class="g-actions">
      <button class="ibtn" onclick="openEditGame('${jid}','${g.id}')">✏️</button>
      <button class="ibtn d" onclick="conf('Eliminar partido','',()=>deleteGame('${jid}','${g.id}'))">🗑</button>
    </div>
  </div>`;
}
 
function toggleJorn(id) {
  const j = S.jornadas.find(x => x.id === id);
  if (j) j.open = !j.open;
  saveCat(); renderJornadas();
}
function deleteJorn(id) {
  S.jornadas = S.jornadas.filter(x => x.id !== id);
  saveCat(); renderJornadas(); toast('Jornada eliminada', 'ok');
}
function deleteGame(jid, gid) {
  const j = S.jornadas.find(x => x.id === jid);
  if (j) j.games = j.games.filter(x => x.id !== gid);
  saveCat(); renderJornadas(); toast('Partido eliminado', 'ok');
}
 
/* ══════════════════════════════════════════════════════════
   TABLA DE POSICIONES
   ══════════════════════════════════════════════════════════ */
function syncTablaFromGames() {
  const teams = {};
  S.jornadas.forEach(j => j.games.forEach(g => {
    if (g.modo !== 'finalizado') return;
    [g.eA, g.eB].forEach(t => { if (!teams[t]) teams[t] = { jj:0,jg:0,jp:0,pf:0,pc:0 }; });
    teams[g.eA].jj++; teams[g.eB].jj++;
    teams[g.eA].pf += (g.pA||0); teams[g.eA].pc += (g.pB||0);
    teams[g.eB].pf += (g.pB||0); teams[g.eB].pc += (g.pA||0);
    if ((g.pA||0) > (g.pB||0)) { teams[g.eA].jg++; teams[g.eB].jp++; }
    else { teams[g.eB].jg++; teams[g.eA].jp++; }
  }));
  Object.entries(teams).forEach(([nombre, st]) => {
    let row = S.tabla.find(r => r.nombre === nombre);
    if (!row) { S.tabla.push({ id: uid(), nombre, ...st, pts: st.jg*2+st.jj }); }
    else { Object.assign(row, st); row.pts = row.jg*2+row.jj; }
  });
}
 
function renderTabla() {
  syncTablaFromGames(); saveCat();
  const tbody = document.getElementById('catStBody');
  if (!S.tabla.length) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:var(--dim);padding:36px">Sin datos. Agrega resultados en Jornadas.</td></tr>';
    return;
  }
  tbody.innerHTML = S.tabla.map((t, i) => {
    const dif = (t.pf||0) - (t.pc||0);
    const ds  = dif > 0 ? `+${dif}` : String(dif);
    const dc  = dif >= 0 ? 'var(--gr)' : 'var(--rd)';
    return `<tr draggable="true" data-id="${t.id}"
      ondragstart="dStart(event,'${t.id}')"
      ondragover="dOver(event,'${t.id}')"
      ondrop="dDrop(event,'${t.id}')"
      ondragleave="dLeave(event)">
      <td><span class="rank-n${i<3?' top':''}">${i+1}</span></td>
      <td><span class="t-name-cell ec" contenteditable="true" onblur="updTabla('${t.id}','nombre',this.textContent)">${t.nombre}</span></td>
      <td><span class="ec" contenteditable="true" onblur="updTablaNum('${t.id}','jj',this.textContent)">${t.jj||0}</span></td>
      <td><span class="ec" contenteditable="true" onblur="updTablaNum('${t.id}','jg',this.textContent)">${t.jg||0}</span></td>
      <td><span class="ec" contenteditable="true" onblur="updTablaNum('${t.id}','jp',this.textContent)">${t.jp||0}</span></td>
      <td><span class="ec" contenteditable="true" onblur="updTablaNum('${t.id}','pf',this.textContent)">${t.pf||0}</span></td>
      <td><span class="ec" contenteditable="true" onblur="updTablaNum('${t.id}','pc',this.textContent)">${t.pc||0}</span></td>
      <td style="color:${dc}">${ds}</td>
      <td><span class="pts-c ec" contenteditable="true" onblur="updTablaNum('${t.id}','pts',this.textContent)">${t.pts||0}</span></td>
      <td><button class="ibtn d" onclick="conf('Eliminar de tabla','',()=>deleteTablaRow('${t.id}'))">🗑</button></td>
    </tr>`;
  }).join('');
}
 
function updTabla(id, field, val) {
  const r = S.tabla.find(x => x.id === id);
  if (r) r[field] = val.trim() || r[field];
  saveCat();
}
function updTablaNum(id, field, val) {
  const r = S.tabla.find(x => x.id === id);
  if (r) r[field] = parseInt(val) || 0;
  saveCat();
}
function deleteTablaRow(id) {
  S.tabla = S.tabla.filter(x => x.id !== id);
  saveCat(); renderTabla(); toast('Equipo quitado de tabla', 'ok');
}
 
/* Drag & drop tabla */
let dragId = null;
function dStart(e, id) { dragId = id; e.currentTarget.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; }
function dOver(e, id)  { e.preventDefault(); document.querySelectorAll('tr[data-id]').forEach(r => r.classList.remove('drag-over')); if (id !== dragId) e.currentTarget.classList.add('drag-over'); }
function dLeave(e)     { e.currentTarget.classList.remove('drag-over'); }
function dDrop(e, tid) {
  e.currentTarget.classList.remove('drag-over');
  if (dragId === tid) return;
  const fi = S.tabla.findIndex(x => x.id === dragId);
  const ti = S.tabla.findIndex(x => x.id === tid);
  const [item] = S.tabla.splice(fi, 1);
  S.tabla.splice(ti, 0, item);
  dragId = null; saveCat(); renderTabla(); toast('Posición actualizada', 'ok');
}
document.addEventListener('dragend', () => {
  document.querySelectorAll('tr.dragging').forEach(r => r.classList.remove('dragging'));
  document.querySelectorAll('tr.drag-over').forEach(r => r.classList.remove('drag-over'));
});
 
function openAddTeamTabla() {
  document.getElementById('tNewName').value = '';
  openM('mAddTeam');
}
function addTeamTabla() {
  const n = document.getElementById('tNewName').value.trim();
  if (!n) { toast('Escribe un nombre', 'err'); return; }
  if (S.tabla.find(r => r.nombre === n)) { toast('Ya existe en tabla', 'err'); return; }
  S.tabla.push({ id: uid(), nombre: n, jj:0, jg:0, jp:0, pf:0, pc:0, pts:0 });
  saveCat(); closeM('mAddTeam'); renderTabla(); toast('Equipo agregado', 'ok');
}
 
/* ══════════════════════════════════════════════════════════
   EQUIPOS Y ASISTENCIA
   ══════════════════════════════════════════════════════════ */
function renderEquipos() {
  const c = document.getElementById('catEqList');
  if (!S.equipos.length) {
    c.innerHTML = '<p style="color:var(--dim);padding:20px 0">Sin equipos aún.</p>';
    return;
  }
  c.innerHTML = S.equipos.map(eq => eqHTML(eq)).join('');
}
 
/**
 * Genera el HTML de un equipo.
 * La tabla de asistencia tiene scroll horizontal automático cuando
 * hay más jornadas de las que caben en pantalla.
 */
function eqHTML(eq) {
  const jornadas = S.jornadas;
 
  // ── Encabezados de jornadas ──────────────────────────────
  const jornHeaders = jornadas.map(j =>
    `<th class="jorn-header-th" title="${j.nombre} · ${j.fechaLabel || fmtDate(j.fecha) || ''}">
       ${j.nombre.replace('Jornada', 'J').trim()}
     </th>`
  ).join('');
 
  // ── Filas de jugadores ───────────────────────────────────
  const rows = eq.jugadores.map(p => {
    const asistCols = jornadas.map(j => {
      const est = p.asistencia && p.asistencia[j.id];
      let cls = 'none', emoji = '—';
      if (est === 'P') { cls = 'presente'; emoji = '✔'; }
      if (est === 'A') { cls = 'ausente';  emoji = '✖'; }
      return `<td><button class="asist-btn ${cls}"
        onclick="toggleAsist('${eq.id}','${p.id}','${j.id}')"
        title="${j.nombre}: ${est === 'P' ? 'Presente' : est === 'A' ? 'Ausente' : 'Sin marcar'}"
      >${emoji}</button></td>`;
    }).join('');
 
    const pres = Object.values(p.asistencia || {}).filter(v => v === 'P').length;
    const aus  = Object.values(p.asistencia || {}).filter(v => v === 'A').length;
 
    return `<tr>
      <td><input class="asist-num-input" value="${p.num}" placeholder="#"
        onchange="updPlayer('${eq.id}','${p.id}','num',this.value)"/></td>
      <td><input class="asist-name-input" value="${p.nombre}" placeholder="Nombre"
        onchange="updPlayer('${eq.id}','${p.id}','nombre',this.value)"/></td>
      ${asistCols}
      <td class="asist-stat"><span class="p">${pres}✔</span>&nbsp;<span class="a">${aus}✖</span></td>
      <td><button class="ibtn d" onclick="conf('Eliminar jugador','',()=>deletePlayer('${eq.id}','${p.id}'))">🗑</button></td>
    </tr>`;
  }).join('');
 
  const noPlayers = `<tr><td colspan="${4+jornadas.length}" style="color:var(--dim);padding:14px 0;font-size:12px">Sin jugadores registrados.</td></tr>`;
 
  return `
  <div class="eq-card${eq.open ? ' open' : ''}" id="ec-${eq.id}">
    <div class="eq-hd" onclick="toggleEq('${eq.id}')">
      <div class="eq-left">
        <div class="eq-av">${eq.nombre.slice(0,2).toUpperCase()}</div>
        <div>
          <div onclick="event.stopPropagation()">
            <input class="eq-ne" value="${eq.nombre}"
              onblur="updEqNombre('${eq.id}',this.value)"
              onclick="event.stopPropagation()"/>
          </div>
          <div class="eq-meta">${eq.jugadores.length} jugador${eq.jugadores.length!==1?'es':''}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <button class="ibtn d" onclick="event.stopPropagation();conf('Eliminar equipo','',()=>deleteEquipo('${eq.id}'))">🗑</button>
        <span class="chevron">▾</span>
      </div>
    </div>
    <div class="eq-body">
      <div class="asist-wrap">
        <table class="asist-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Jugador</th>
              ${jornHeaders || '<th style="color:var(--dim)">Sin jornadas</th>'}
              <th>Asist.</th>
              <th></th>
            </tr>
          </thead>
          <tbody>${rows || noPlayers}</tbody>
        </table>
      </div>
      <button class="add-player" onclick="addPlayer('${eq.id}')">＋ Agregar jugador</button>
      ${jornadas.length === 0 ? '<p class="asist-legend">Agrega jornadas en la pestaña Jornadas para registrar asistencia.</p>' : '<p class="asist-legend">Clic en celda: <b style="color:var(--gr)">✔</b> Presente → <b style="color:var(--rd)">✖</b> Ausente → — Sin marcar</p>'}
    </div>
  </div>`;
}
 
function toggleEq(id) { const e = S.equipos.find(x=>x.id===id); if(e) e.open=!e.open; saveCat(); renderEquipos(); }
function updEqNombre(id, val) { const e = S.equipos.find(x=>x.id===id); if(e&&val.trim()) e.nombre=val.trim(); saveCat(); renderEquipos(); }
function deleteEquipo(id) { S.equipos=S.equipos.filter(x=>x.id!==id); saveCat(); renderEquipos(); toast('Equipo eliminado','ok'); }
 
function addEquipo() {
  const eq = { id:uid(), nombre:'Nuevo Equipo', open:true, jugadores:[] };
  S.equipos.push(eq); saveCat(); renderEquipos();
  setTimeout(() => { const el=document.querySelector(`#ec-${eq.id} .eq-ne`); if(el){el.focus();el.select();} }, 80);
}
function addPlayer(eqId) {
  const eq = S.equipos.find(x=>x.id===eqId); if(!eq) return;
  eq.jugadores.push({ id:uid(), num:'', nombre:'Nuevo Jugador', asistencia:{} });
  saveCat(); renderEquipos();
}
function updPlayer(eqId, pId, field, val) {
  const eq = S.equipos.find(x=>x.id===eqId); if(!eq) return;
  const p  = eq.jugadores.find(x=>x.id===pId); if(!p) return;
  p[field] = val; saveCat();
}
function deletePlayer(eqId, pId) {
  const eq = S.equipos.find(x=>x.id===eqId); if(!eq) return;
  eq.jugadores = eq.jugadores.filter(x=>x.id!==pId);
  saveCat(); renderEquipos(); toast('Jugador eliminado','ok');
}
 
/**
 * Alterna asistencia: sin marcar → P → A → sin marcar
 */
function toggleAsist(eqId, pId, jId) {
  const eq = S.equipos.find(x=>x.id===eqId); if(!eq) return;
  const p  = eq.jugadores.find(x=>x.id===pId); if(!p) return;
  if (!p.asistencia) p.asistencia = {};
  const cur  = p.asistencia[jId];
  const next = cur==='P' ? 'A' : cur==='A' ? null : 'P';
  if (next) p.asistencia[jId] = next;
  else delete p.asistencia[jId];
  saveCat(); renderEquipos();
}
 
/* ══════════════════════════════════════════════════════════
   GALERÍA — fotos (archivo) + videos (URL / YouTube)
   ══════════════════════════════════════════════════════════ */
 
// Estado local de la galería
let _galMode        = 'foto'; // 'foto' | 'video'
let _galPhotoData   = null;   // base64 de la foto pendiente
 
/** Renderiza la galería completa (formulario + items) */
function renderGaleria() {
  const panelEl = document.getElementById('catPanel-galeria');
 
  panelEl.innerHTML = `
  <h2 class="sec-h">Galería</h2>
 
  <!-- ── Formulario de agregar media ── -->
  <div class="gal-add-section">
    <div class="gal-add-title">📎 Agregar contenido</div>
 
    <!-- Toggle foto / video -->
    <div class="gal-type-toggle">
      <button class="gal-type-btn${_galMode==='foto'?' active':''}" onclick="setGalMode('foto')">📷 Foto</button>
      <button class="gal-type-btn${_galMode==='video'?' active':''}" onclick="setGalMode('video')">🎬 Video</button>
    </div>
 
    <!-- Campos FOTO -->
    <div id="galFotoFields" style="display:${_galMode==='foto'?'block':'none'}">
      <div class="gal-photo-drop" id="galPhotoDrop" onclick="document.getElementById('galFileInput').click()">
        <span style="font-size:22px">📷</span>
        <span>Haz clic o arrastra una imagen</span>
        <input type="file" id="galFileInput" accept="image/*" style="display:none" onchange="previewGalPhoto(event)"/>
      </div>
      <div class="gal-form-row">
        <div class="fg"><label class="fl">Título</label><input class="fi" id="galPhotoTitle" placeholder="Título de la foto"/></div>
        <div class="fg"><label class="fl">Descripción (opcional)</label><input class="fi" id="galPhotoDesc" placeholder="Descripción..."/></div>
      </div>
      <div style="text-align:right">
        <button class="btn primary" onclick="addGalPhoto()">+ Agregar foto</button>
      </div>
    </div>
 
    <!-- Campos VIDEO -->
    <div id="galVideoFields" style="display:${_galMode==='video'?'block':'none'}">
      <div class="gal-form-row single">
        <div class="fg"><label class="fl">URL del video (YouTube, MP4…)</label><input class="fi" id="galVideoUrl" placeholder="https://youtube.com/watch?v=..."/></div>
      </div>
      <div class="gal-form-row">
        <div class="fg"><label class="fl">Título</label><input class="fi" id="galVideoTitle" placeholder="Título del video"/></div>
        <div class="fg"><label class="fl">Descripción (opcional)</label><input class="fi" id="galVideoDesc" placeholder="Descripción..."/></div>
      </div>
      <div style="text-align:right">
        <button class="btn primary" onclick="addGalVideo()">+ Agregar video</button>
      </div>
    </div>
  </div>
 
  <!-- ── Grid de items ── -->
  <div class="gal-grid" id="catGalGrid">
    ${S.media.map((m, i) => galItemHTML(m, i)).join('')}
  </div>`;
 
  // Restablecer preview si hay foto pendiente
  if (_galPhotoData) {
    const drop = document.getElementById('galPhotoDrop');
    if (drop) {
      let img = drop.querySelector('img');
      if (!img) { img = document.createElement('img'); drop.appendChild(img); }
      img.src = _galPhotoData;
      // Mostrar overlay de "cambiar foto"
      let ov = drop.querySelector('.drop-overlay');
      if (!ov) { ov = document.createElement('div'); ov.className = 'drop-overlay'; drop.appendChild(ov); }
      ov.textContent = '📷 Cambiar foto';
    }
  }
}
 
/** Genera HTML de un item de galería */
function galItemHTML(m, i) {
  let mediaHtml = '';
  if (m.type === 'photo') {
    mediaHtml = `<img src="${m.data}" alt="${m.title}" loading="lazy"/>`;
  } else {
    const ytId = getYouTubeId(m.url || '');
    if (ytId) {
      mediaHtml = `<div class="yt-wrap"><iframe src="https://www.youtube.com/embed/${ytId}" title="${m.title}" allowfullscreen></iframe></div>`;
    } else {
      mediaHtml = `<video src="${m.url}" controls></video>`;
    }
  }
  return `<div class="gal-item">
    ${mediaHtml}
    <div class="gal-title">${m.title}</div>
    <span class="gal-badge">${m.type === 'photo' ? '📷 Foto' : '🎬 Video'}</span>
    <button class="gal-del" onclick="deleteGalItem(${i})">✕ Eliminar</button>
  </div>`;
}
 
/** Alterna entre modo foto y modo video */
function setGalMode(mode) {
  _galMode = mode;
  // Re-render solo los campos sin perder el preview
  document.getElementById('galFotoFields').style.display  = mode==='foto'  ? 'block' : 'none';
  document.getElementById('galVideoFields').style.display = mode==='video' ? 'block' : 'none';
  document.querySelectorAll('.gal-type-btn').forEach((b, i) => {
    b.classList.toggle('active', (i===0&&mode==='foto')||(i===1&&mode==='video'));
  });
}
 
/** Previsualiza la foto seleccionada */
function previewGalPhoto(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    _galPhotoData = ev.target.result;
    const drop = document.getElementById('galPhotoDrop');
    if (!drop) return;
    // Limpiar contenido interno y poner imagen
    drop.innerHTML = `
      <img src="${_galPhotoData}" alt="preview" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"/>
      <div class="drop-overlay">📷 Cambiar foto</div>
      <input type="file" id="galFileInput" accept="image/*" style="display:none" onchange="previewGalPhoto(event)"/>`;
  };
  reader.readAsDataURL(file);
}
 
/** Agrega una foto al array de media */
function addGalPhoto() {
  if (!_galPhotoData) { toast('Selecciona una foto primero', 'err'); return; }
  const title = (document.getElementById('galPhotoTitle')?.value || '').trim() || 'Sin título';
  const desc  = (document.getElementById('galPhotoDesc')?.value  || '').trim();
  S.media.push({ type:'photo', data:_galPhotoData, title, desc });
  _galPhotoData = null;
  saveCat(); renderGaleria(); toast('Foto agregada', 'ok');
}
 
/** Agrega un video al array de media */
function addGalVideo() {
  const url   = (document.getElementById('galVideoUrl')?.value   || '').trim();
  const title = (document.getElementById('galVideoTitle')?.value || '').trim() || 'Sin título';
  const desc  = (document.getElementById('galVideoDesc')?.value  || '').trim();
  if (!url) { toast('Escribe la URL del video', 'err'); return; }
  S.media.push({ type:'video', url, title, desc });
  saveCat(); renderGaleria(); toast('Video agregado', 'ok');
}
 
/** Elimina un item de la galería por índice */
function deleteGalItem(i) {
  S.media.splice(i, 1);
  saveCat(); renderGaleria(); toast('Eliminado', 'ok');
}
 
/* ══════════════════════════════════════════════════════════
   MODAL JORNADA
   ══════════════════════════════════════════════════════════ */
let _ejid = null;
 
function openAddJornada() {
  _ejid = null;
  document.getElementById('mJTitle').textContent = 'Agregar Jornada';
  document.getElementById('jNombre').value       = `Jornada ${S.jornadas.length + 1}`;
  document.getElementById('jFecha').value        = '';
  document.getElementById('jLabel').value        = '';
  openM('mJornada');
}
function openEditJorn(id) {
  _ejid = id;
  const j = S.jornadas.find(x => x.id === id);
  document.getElementById('mJTitle').textContent = 'Editar Jornada';
  document.getElementById('jNombre').value       = j.nombre;
  document.getElementById('jFecha').value        = j.fecha || '';
  document.getElementById('jLabel').value        = j.fechaLabel || '';
  openM('mJornada');
}
function saveJornada() {
  const nombre     = document.getElementById('jNombre').value.trim();
  const fecha      = document.getElementById('jFecha').value;
  const fechaLabel = document.getElementById('jLabel').value.trim();
  if (!nombre) { toast('Escribe el nombre de la jornada', 'err'); return; }
  if (_ejid) {
    const j = S.jornadas.find(x => x.id === _ejid);
    Object.assign(j, { nombre, fecha, fechaLabel });
    toast('Jornada actualizada', 'ok');
  } else {
    S.jornadas.push({ id:uid(), nombre, fecha, fechaLabel, open:true, games:[] });
    toast('Jornada agregada', 'ok');
  }
  saveCat(); closeM('mJornada'); renderJornadas();
}
 
/* ══════════════════════════════════════════════════════════
   MODAL PARTIDO
   ══════════════════════════════════════════════════════════ */
let _gjid = null, _ggid = null, _gm = 'pendiente';
 
function setGM(m) {
  _gm = m;
  document.getElementById('catBtnPend').classList.toggle('active', m==='pendiente');
  document.getElementById('catBtnFin').classList.toggle('active',  m==='finalizado');
  document.getElementById('catSPend').style.display = m==='pendiente'  ? '' : 'none';
  document.getElementById('catSFin').style.display  = m==='finalizado' ? '' : 'none';
}
function openAddGame(jid) {
  _gjid=jid; _ggid=null;
  document.getElementById('mGTitle').textContent = 'Agregar Partido';
  ['gEqA','gEqB','gFecha','gHora','gFechaF','gHoraF'].forEach(id => { document.getElementById(id).value=''; });
  document.getElementById('gPtA').value='';
  document.getElementById('gPtB').value='';
  setGM('pendiente'); openM('mGame');
}
function openEditGame(jid, gid) {
  _gjid=jid; _ggid=gid;
  const j = S.jornadas.find(x=>x.id===jid);
  const g = j.games.find(x=>x.id===gid);
  document.getElementById('mGTitle').textContent = 'Editar Partido';
  document.getElementById('gEqA').value = g.eA;
  document.getElementById('gEqB').value = g.eB;
  setGM(g.modo);
  if (g.modo==='pendiente') {
    document.getElementById('gFecha').value = g.fecha||'';
    document.getElementById('gHora').value  = g.hora ||'';
  } else {
    document.getElementById('gPtA').value    = g.pA??'';
    document.getElementById('gPtB').value    = g.pB??'';
    document.getElementById('gFechaF').value = g.fecha||'';
    document.getElementById('gHoraF').value  = g.hora ||'';
  }
  openM('mGame');
}
function saveGame() {
  const eA = document.getElementById('gEqA').value.trim();
  const eB = document.getElementById('gEqB').value.trim();
  if (!eA||!eB) { toast('Escribe ambos equipos','err'); return; }
  const j = S.jornadas.find(x=>x.id===_gjid);
  let gd = { eA, eB, modo:_gm };
  if (_gm==='pendiente') {
    gd.fecha=document.getElementById('gFecha').value;
    gd.hora =document.getElementById('gHora').value;
    gd.pA=null; gd.pB=null;
  } else {
    gd.pA    = parseInt(document.getElementById('gPtA').value)||0;
    gd.pB    = parseInt(document.getElementById('gPtB').value)||0;
    gd.fecha = document.getElementById('gFechaF').value;
    gd.hora  = document.getElementById('gHoraF').value;
  }
  if (_ggid) {
    const idx = j.games.findIndex(x=>x.id===_ggid);
    j.games[idx] = { ...j.games[idx], ...gd };
    toast('Partido actualizado','ok');
  } else {
    j.games.push({ id:uid(), ...gd });
    toast('Partido agregado','ok');
  }
  saveCat(); closeM('mGame'); renderJornadas();
}
 
/* ══════════════════════════════════════════════════════════
   MODAL CONFIRMACIÓN
   ══════════════════════════════════════════════════════════ */
let _cb = null;
function conf(title, msg, cb) {
  document.getElementById('mCTitle').textContent = title;
  document.getElementById('mCMsg').textContent   = msg || 'Esta acción no se puede deshacer.';
  _cb = cb; openM('mConf');
}
function doConfirm() { if (_cb) _cb(); _cb=null; closeM('mConf'); }
 
/* ══ HELPERS MODAL ══════════════════════════════════════════ */
function openM(id) { document.getElementById(id).classList.add('open'); }
function closeM(id){ document.getElementById(id).classList.remove('open'); }
 
/* ══ INIT ══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Cerrar modal principal al hacer clic en el fondo
  const back = document.getElementById('catModalBack');
  if (back) back.addEventListener('click', e => { if (e.target===back) closeCatModal(); });
 
  // Cerrar modales internos al hacer clic en el fondo
  document.querySelectorAll('.mback').forEach(b => {
    b.addEventListener('click', e => { if (e.target===b) b.classList.remove('open'); });
  });
 
  // Escape cierra modales
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const open = document.querySelector('.mback.open');
    if (open) { open.classList.remove('open'); return; }
    closeCatModal();
  });
});