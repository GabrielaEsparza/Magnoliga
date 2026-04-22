// ══════════════════════════════════════════
// deporturismo.js  —  Magnoliga (API version)
// ══════════════════════════════════════════

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

// ── HELPERS ──────────────────────────────────

// FIX 1: getYouTubeId robusto — usa URL nativa para parsear query params.
// Cubre: watch?v=, youtu.be/, /embed/, /shorts/ e ignora &t=, &list=, &si=, etc.
function getYouTubeId(rawUrl) {
  if (!rawUrl) return null;
  try {
    const url = new URL(rawUrl);
    if (url.searchParams.has('v')) return url.searchParams.get('v');
    const pathMatch = url.pathname.match(/\/(embed|shorts|v)\/([a-zA-Z0-9_-]{11})/);
    if (pathMatch) return pathMatch[2];
    if (url.hostname === 'youtu.be') {
      const id = url.pathname.slice(1).split('?')[0];
      if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }
    return null;
  } catch {
    const m = rawUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  }
}

function showToast(msg, isError = false) {
  const el = document.getElementById('liveToast');
  if (!el) return;
  el.className = 'toast align-items-center text-white border-0' + (isError ? ' toast-error' : '');
  document.getElementById('toastMsg').textContent = msg;
  bootstrap.Toast.getOrCreateInstance(el, { delay: 2200 }).show();
}

// ── RENDER ───────────────────────────────────
async function renderMedia() {
  const grid   = document.getElementById('user-media-grid');
  const addCol = document.getElementById('add-card-col');

  grid.querySelectorAll('.user-card-col').forEach(el => el.remove());

  let items = [];
  try {
    items = await api('/api/depoturismo/');
  } catch(e) { return; }

  items.forEach(item => {
    const col = document.createElement('div');
    col.className = 'col-md-6 user-card-col';

    let mediaHtml;

    if (item.tipo === 'foto') {
      // FIX 2: Asegurar ruta absoluta en imágenes
      const imgSrc = item.imagen
        ? (item.imagen.startsWith('http') || item.imagen.startsWith('/') ? item.imagen : `/${item.imagen}`)
        : '';
      mediaHtml = `<img src="${imgSrc}"
        class="card-img-top gallery-img"
        alt="${item.titulo}"
        loading="lazy"
        onerror="this.src=''; this.style.minHeight='180px'; this.style.background='#222';">`;

    } else {
      // FIX 3: Miniatura clickeable en lugar de iframe inmediato
      const ytId = getYouTubeId(item.video_url || '');

      if (!ytId) {
        mediaHtml = `
          <div class="ratio ratio-16x9 d-flex align-items-center justify-content-center bg-dark text-secondary">
            <span><i class="bi bi-exclamation-circle me-1"></i>URL de video no válida</span>
          </div>`;
      } else {
        mediaHtml = `
          <div class="ratio ratio-16x9 yt-thumb-wrapper" data-ytid="${ytId}" style="cursor:pointer; position:relative;">
            <img
              src="https://img.youtube.com/vi/${ytId}/hqdefault.jpg"
              alt="${item.titulo}"
              loading="lazy"
              class="w-100 h-100"
              style="object-fit:cover;"
              onerror="this.src='https://img.youtube.com/vi/${ytId}/mqdefault.jpg'">
            <div class="yt-play-btn" style="
              position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
              background:rgba(0,0,0,0.7); border-radius:50%; width:56px; height:56px;
              display:flex; align-items:center; justify-content:center; pointer-events:none;">
              <i class="bi bi-play-fill text-white fs-4" style="margin-left:3px;"></i>
            </div>
          </div>`;
      }
    }

    const descHtml = item.descripcion
      ? `<p class="card-desc px-3 pb-2 mb-0">${item.descripcion}</p>`
      : '';

    const removeBtn = typeof ES_ADMIN !== 'undefined' && ES_ADMIN
      ? `<button class="remove-btn" data-id="${item.id}"><i class="bi bi-x-lg"></i></button>`
      : '';

    col.innerHTML = `
      <div class="card bg-card border-0 overflow-hidden user-card">
        ${removeBtn}
        ${mediaHtml}
        <div class="card-body py-2 px-3">
          <p class="text-white small mb-0 fw-medium">${item.titulo}</p>
        </div>
        ${descHtml}
      </div>`;

    if (addCol) {
      grid.insertBefore(col, addCol);
    } else {
      grid.appendChild(col);
    }
  });

  // FIX 4: Click en miniatura → reemplaza por iframe con autoplay
  grid.querySelectorAll('.yt-thumb-wrapper').forEach(wrapper => {
    wrapper.addEventListener('click', function() {
      const ytId = this.dataset.ytid;
      this.innerHTML = `
        <iframe
          src="https://www.youtube.com/embed/${ytId}?autoplay=1"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          style="width:100%; height:100%; border:0;">
        </iframe>`;
      this.style.cursor = 'default';
    });
  });

  // Eventos eliminar
  grid.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      if (!confirm('¿Eliminar este elemento?')) return;
      try {
        await api(`/api/depoturismo/${this.dataset.id}/`, 'DELETE');
        await renderMedia();
        showToast('Eliminado');
      } catch(e) {
        showToast('Error al eliminar', true);
      }
    });
  });
}

// ── INIT ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', async function() {

  await renderMedia();

  if (typeof ES_ADMIN === 'undefined' || !ES_ADMIN) return;

  const dropzone      = document.getElementById('dropzone');
  const photoDropzone = document.getElementById('photo-dropzone');
  if (!dropzone || !photoDropzone) return;

  const modal      = new bootstrap.Modal(document.getElementById('addMediaModal'));
  const photoModal = new bootstrap.Modal(document.getElementById('addPhotoModal'));

  let pendingPhotoFile = null;

  // ── Video ──
  dropzone.addEventListener('click', () => {
    document.getElementById('mediaTitle').value = '';
    document.getElementById('mediaUrl').value   = '';
    document.getElementById('mediaDesc').value  = '';
    modal.show();
  });

  dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('dragover'); });
  dropzone.addEventListener('dragleave', () => { dropzone.classList.remove('dragover'); });
  dropzone.addEventListener('drop', e => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    const text = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text/uri-list');
    if (text) { document.getElementById('mediaUrl').value = text; modal.show(); }
  });

  document.getElementById('submitMedia').addEventListener('click', async () => {
    const title = document.getElementById('mediaTitle').value.trim();
    const url   = document.getElementById('mediaUrl').value.trim();
    const desc  = document.getElementById('mediaDesc').value.trim();
    if (!title || !url) return;

    // FIX 5: Validar URL de YouTube antes de guardar
    if (!getYouTubeId(url)) {
      showToast('La URL no es un link válido de YouTube', true);
      return;
    }

    const fd = new FormData();
    fd.append('tipo',        'video');
    fd.append('titulo',      title);
    fd.append('descripcion', desc);
    fd.append('video_url',   url);

    try {
      await api('/api/depoturismo/', 'POST', fd);
      modal.hide();
      await renderMedia();
      showToast('Video agregado');
    } catch(e) {
      showToast('Error al agregar video', true);
    }
  });

  // ── Foto ──
  const photoModalInput         = document.getElementById('photo-modal-input');
  const photoPreviewImg         = document.getElementById('photo-preview-img');
  const photoPreviewPlaceholder = document.getElementById('photo-preview-placeholder');

  photoDropzone.addEventListener('click', () => {
    pendingPhotoFile = null;
    document.getElementById('photoTitle').value = '';
    document.getElementById('photoDesc').value  = '';
    photoPreviewImg.classList.add('d-none');
    photoPreviewPlaceholder.classList.remove('d-none');
    photoModal.show();
  });

  document.getElementById('photo-preview-box').addEventListener('click', () => {
    photoModalInput.click();
  });

  photoModalInput.addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;
    pendingPhotoFile = file;
    const reader = new FileReader();
    reader.onload = e => {
      photoPreviewImg.src = e.target.result;
      photoPreviewImg.classList.remove('d-none');
      photoPreviewPlaceholder.classList.add('d-none');
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('submitPhoto').addEventListener('click', async () => {
    const title = document.getElementById('photoTitle').value.trim();
    const desc  = document.getElementById('photoDesc').value.trim();
    if (!title || !pendingPhotoFile) return;

    const fd = new FormData();
    fd.append('tipo',        'foto');
    fd.append('titulo',      title);
    fd.append('descripcion', desc);
    fd.append('imagen',      pendingPhotoFile);

    try {
      await api('/api/depoturismo/', 'POST', fd);
      photoModal.hide();
      await renderMedia();
      showToast('Foto agregada');
    } catch(e) {
      showToast('Error al agregar foto', true);
    }
  });

});