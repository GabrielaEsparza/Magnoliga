// ══════════════════════════════════════════
// comunicaciones.js  —  Magnoliga (API version)
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

// ── HELPERS ──────────────────────────────────
function getYouTubeId(url) {
  const m = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
  );
  return m ? m[1] : null;
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

  // Quitar cards existentes
  grid.querySelectorAll('.user-card-col').forEach(el => el.remove());

  let items = [];
  try {
    items = await api('/api/comunicaciones/');
  } catch(e) { return; }

  items.forEach(item => {
    const col = document.createElement('div');
    col.className = 'col-md-6 user-card-col';

    let mediaHtml;
    if (item.tipo === 'foto') {
      mediaHtml = `<img src="${item.imagen}" class="card-img-top gallery-img" alt="${item.titulo}">`;
    } else {
      const ytId = getYouTubeId(item.video_url || '');
      mediaHtml = `
        <div class="ratio ratio-16x9">
          <iframe src="https://www.youtube.com/embed/${ytId}" allowfullscreen loading="lazy"></iframe>
        </div>`;
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

    // Insertar antes de los dropzones si es admin, o al final si no
    if (addCol) {
      grid.insertBefore(col, addCol);
    } else {
      grid.appendChild(col);
    }
  });

  // Eventos eliminar
  grid.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      if (!confirm('¿Eliminar este elemento?')) return;
      try {
        await api(`/api/comunicaciones/${this.dataset.id}/`, 'DELETE');
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

  // Solo si es admin
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

  document.getElementById('submitMedia').addEventListener('click', async () => {
    const title = document.getElementById('mediaTitle').value.trim();
    const url   = document.getElementById('mediaUrl').value.trim();
    const desc  = document.getElementById('mediaDesc').value.trim();
    if (!title || !url) return;

    const fd = new FormData();
    fd.append('tipo',        'video');
    fd.append('titulo',      title);
    fd.append('descripcion', desc);
    fd.append('video_url',   url);

    try {
      await api('/api/comunicaciones/', 'POST', fd);
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
      await api('/api/comunicaciones/', 'POST', fd);
      photoModal.hide();
      await renderMedia();
      showToast('Foto agregada');
    } catch(e) {
      showToast('Error al agregar foto', true);
    }
  });

});