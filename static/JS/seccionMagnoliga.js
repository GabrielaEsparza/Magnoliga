// ══════════════════════════════════════════
// seccionMagnoliga.js  —  API version
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
  if (body instanceof FormData) {
    opts.body = body;
  } else if (body) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

let sponsors = [];
let pendingImageData = null;
let editPendingImageData = null;

// ── RENDER ──────────────────────────────────
function renderSponsors() {
  const grid = document.getElementById('sponsors-grid');

  if (!sponsors.length) {
    grid.innerHTML = `
      <div class="col-12 empty-state">
        <i class="bi bi-shield-x d-block"></i>
        <p class="mb-0">No hay patrocinadores aún.</p>
      </div>`;
    return;
  }

  grid.innerHTML = sponsors.map((s, i) => {
    const adminBtns = ES_ADMIN ? `
      <button class="btn-delete-sponsor" onclick="deleteSponsor(event,${s.id})" title="Eliminar">
        <i class="bi bi-trash3"></i>
      </button>
      <button class="btn-edit-sponsor" onclick="openEditModal(event,${s.id})" title="Editar">
        <i class="bi bi-pencil"></i>
      </button>` : '';

    return `
    <div class="col-md-6 col-lg-3 sponsor-col" style="animation-delay:${i * 0.07}s">
      <div class="sponsor-card" onclick="viewSponsor(${s.id})">
        ${adminBtns}
        <div class="sponsor-img-wrap">
          ${s.img
            ? `<img src="${s.img}" alt="${s.nombre}" loading="lazy">`
            : `<div class="sponsor-img-placeholder"><i class="bi bi-building"></i></div>`
          }
        </div>
        <div class="sponsor-body">
          <p class="sponsor-name mb-1">${s.nombre}</p>
          <p class="sponsor-cat">${s.categoria}</p>
          <p class="sponsor-desc mb-0">${s.desc}</p>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ── CARGAR ───────────────────────────────────
async function loadSponsors() {
  try {
    sponsors = await api('/api/patrocinadores/');
    renderSponsors();
  } catch(e) {
    console.error('Error cargando patrocinadores', e);
  }
}

// ── VER ──────────────────────────────────────
function viewSponsor(id) {
  const s = sponsors.find(x => x.id === id);
  if (!s) return;

  document.getElementById('view-nombre').textContent    = s.nombre;
  document.getElementById('view-categoria').textContent = s.categoria;
  document.getElementById('view-desc').textContent      = s.desc;

  const img         = document.getElementById('view-img');
  const placeholder = document.getElementById('view-img-placeholder');
  if (s.img) {
    img.src = s.img;
    img.classList.remove('d-none');
    placeholder.classList.add('d-none');
  } else {
    img.classList.add('d-none');
    placeholder.classList.remove('d-none');
  }

  const telRow = document.getElementById('view-telefono-row');
  if (s.telefono) {
    document.getElementById('view-telefono').textContent = s.telefono;
    document.getElementById('view-telefono').href = `https://wa.me/${s.telefono.replace(/\D/g,'')}`;
    telRow.classList.remove('d-none');
  } else { telRow.classList.add('d-none'); }

  const emailRow = document.getElementById('view-email-row');
  if (s.email) {
    document.getElementById('view-email').textContent = s.email;
    document.getElementById('view-email').href = `mailto:${s.email}`;
    emailRow.classList.remove('d-none');
  } else { emailRow.classList.add('d-none'); }

  const igEl = document.getElementById('view-instagram');
  if (s.instagram) {
    const handle = s.instagram.startsWith('@') ? s.instagram.slice(1) : s.instagram;
    igEl.href = `https://instagram.com/${handle}`;
    igEl.classList.remove('d-none');
  } else { igEl.classList.add('d-none'); }

  new bootstrap.Modal(document.getElementById('viewSponsorModal')).show();
}

// ── AGREGAR ──────────────────────────────────
document.getElementById('submitSponsor').addEventListener('click', async () => {
  const nombre    = document.getElementById('sp-nombre').value.trim();
  const categoria = document.getElementById('sp-categoria').value.trim();
  const desc      = document.getElementById('sp-desc').value.trim();
  if (!nombre || !categoria || !desc) return;

  const imgUrl = document.getElementById('sp-img-url').value.trim();

  try {
    if (pendingImageData instanceof File) {
      // subir con FormData (imagen local)
      const fd = new FormData();
      fd.append('nombre', nombre);
      fd.append('categoria', categoria);
      fd.append('desc', desc);
      fd.append('telefono',  document.getElementById('sp-telefono').value.trim());
      fd.append('email',     document.getElementById('sp-email').value.trim());
      fd.append('instagram', document.getElementById('sp-instagram').value.trim());
      fd.append('facebook',  document.getElementById('sp-facebook').value.trim());
      fd.append('web',       document.getElementById('sp-web').value.trim());
      fd.append('imagen', pendingImageData);
      fd.append('csrfmiddlewaretoken', getCookie('csrftoken'));
      const nuevo = await api('/api/patrocinadores/', 'POST', fd);
      sponsors.push({ ...nuevo, categoria, desc,
        telefono: document.getElementById('sp-telefono').value.trim(),
        email: document.getElementById('sp-email').value.trim(),
        instagram: document.getElementById('sp-instagram').value.trim(),
        facebook: document.getElementById('sp-facebook').value.trim(),
        web: document.getElementById('sp-web').value.trim(),
      });
    } else {
      // sin imagen o URL
      const fd = new FormData();
      fd.append('nombre', nombre);
      fd.append('categoria', categoria);
      fd.append('desc', desc);
      fd.append('telefono',  document.getElementById('sp-telefono').value.trim());
      fd.append('email',     document.getElementById('sp-email').value.trim());
      fd.append('instagram', document.getElementById('sp-instagram').value.trim());
      fd.append('facebook',  document.getElementById('sp-facebook').value.trim());
      fd.append('web',       document.getElementById('sp-web').value.trim());
      fd.append('imagen_url', imgUrl);
      fd.append('csrfmiddlewaretoken', getCookie('csrftoken'));
      const nuevo = await api('/api/patrocinadores/', 'POST', fd);
      sponsors.push({ ...nuevo, categoria, desc,
        telefono: document.getElementById('sp-telefono').value.trim(),
        email: document.getElementById('sp-email').value.trim(),
        instagram: document.getElementById('sp-instagram').value.trim(),
        facebook: document.getElementById('sp-facebook').value.trim(),
        web: document.getElementById('sp-web').value.trim(),
      });
    }

    renderSponsors();
    bootstrap.Modal.getInstance(document.getElementById('addSponsorModal')).hide();
  } catch(e) {
    alert('Error al agregar patrocinador');
  }
});

// ── EDITAR ───────────────────────────────────
function openEditModal(e, id) {
  e.stopPropagation();
  const s = sponsors.find(x => x.id === id);
  if (!s) return;
  editPendingImageData = null;

  document.getElementById('edit-sp-id').value        = s.id;
  document.getElementById('edit-sp-nombre').value    = s.nombre;
  document.getElementById('edit-sp-categoria').value = s.categoria;
  document.getElementById('edit-sp-desc').value      = s.desc;
  document.getElementById('edit-sp-telefono').value  = s.telefono  || '';
  document.getElementById('edit-sp-email').value     = s.email     || '';
  document.getElementById('edit-sp-instagram').value = s.instagram || '';
  document.getElementById('edit-sp-facebook').value  = s.facebook  || '';
  document.getElementById('edit-sp-web').value       = s.web       || '';
  document.getElementById('edit-sp-img-url').value   = s.img && !s.img.startsWith('/media') ? s.img : '';

  const previewContainer = document.getElementById('edit-img-preview-container');
  const previewImg       = document.getElementById('edit-sp-img-preview');
  if (s.img) {
    previewImg.src = s.img;
    previewContainer.style.display = 'block';
  } else {
    previewContainer.style.display = 'none';
  }

  new bootstrap.Modal(document.getElementById('editSponsorModal')).show();
}

document.getElementById('saveEditSponsor').addEventListener('click', async () => {
  const id        = parseInt(document.getElementById('edit-sp-id').value);
  const nombre    = document.getElementById('edit-sp-nombre').value.trim();
  const categoria = document.getElementById('edit-sp-categoria').value.trim();
  const desc      = document.getElementById('edit-sp-desc').value.trim();
  if (!nombre || !categoria || !desc) return;

  try {
    // 1. Actualizar datos de texto
    await api(`/api/patrocinadores/${id}/`, 'PUT', {
      nombre, categoria, desc,
      telefono:  document.getElementById('edit-sp-telefono').value.trim(),
      email:     document.getElementById('edit-sp-email').value.trim(),
      instagram: document.getElementById('edit-sp-instagram').value.trim(),
      facebook:  document.getElementById('edit-sp-facebook').value.trim(),
      web:       document.getElementById('edit-sp-web').value.trim(),
      imagen_url: document.getElementById('edit-sp-img-url').value.trim(),
    });

    // 2. Si hay imagen nueva, subirla aparte
    if (editPendingImageData instanceof File) {
      const fd = new FormData();
      fd.append('imagen', editPendingImageData);
      fd.append('csrfmiddlewaretoken', getCookie('csrftoken'));
      await api(`/api/patrocinadores/${id}/imagen/`, 'POST', fd);
    }

    await loadSponsors();
    bootstrap.Modal.getInstance(document.getElementById('editSponsorModal')).hide();
  } catch(e) {
    alert('Error al guardar cambios');
  }
});

// ── ELIMINAR ─────────────────────────────────
async function deleteSponsor(e, id) {
  e.stopPropagation();
  if (!confirm('¿Eliminar este patrocinador?')) return;
  try {
    await api(`/api/patrocinadores/${id}/`, 'DELETE');
    sponsors = sponsors.filter(s => s.id !== id);
    renderSponsors();
  } catch(e) {
    alert('Error al eliminar');
  }
}

// ── PREVIEW IMAGEN (agregar) ─────────────────
const btnUpload    = document.getElementById('btn-upload-img');
const fileInput    = document.getElementById('sp-img-file');
const imgUrlInput  = document.getElementById('sp-img-url');
const previewBox   = document.getElementById('img-preview-container');
const previewImg   = document.getElementById('sp-img-preview');
const btnRemoveImg = document.getElementById('btn-remove-img');

btnUpload.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;
  pendingImageData = file;           // guardamos el File, no base64
  showPreview(URL.createObjectURL(file));
  imgUrlInput.value = '';
});
imgUrlInput.addEventListener('input', () => {
  const url = imgUrlInput.value.trim();
  if (url) { pendingImageData = null; showPreview(url); }
  else { clearImagePreview(); }
});
btnRemoveImg.addEventListener('click', () => {
  clearImagePreview();
  imgUrlInput.value = '';
  fileInput.value   = '';
});

function showPreview(src) {
  previewImg.src = src;
  previewBox.style.display = 'block';
}
function clearImagePreview() {
  pendingImageData = null;
  previewImg.src   = '';
  previewBox.style.display = 'none';
}

// ── PREVIEW IMAGEN (editar) ──────────────────
document.getElementById('edit-btn-upload-img').addEventListener('click', () => {
  document.getElementById('edit-sp-img-file').click();
});
document.getElementById('edit-sp-img-file').addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;
  editPendingImageData = file;
  document.getElementById('edit-sp-img-preview').src = URL.createObjectURL(file);
  document.getElementById('edit-img-preview-container').style.display = 'block';
  document.getElementById('edit-sp-img-url').value = '';
});
document.getElementById('edit-btn-remove-img').addEventListener('click', () => {
  editPendingImageData = null;
  document.getElementById('edit-sp-img-preview').src = '';
  document.getElementById('edit-img-preview-container').style.display = 'none';
  document.getElementById('edit-sp-img-url').value = '';
  document.getElementById('edit-sp-img-file').value = '';
});

// ── LIMPIAR MODAL AL CERRAR ──────────────────
document.getElementById('addSponsorModal').addEventListener('hidden.bs.modal', () => {
  ['sp-nombre','sp-categoria','sp-desc','sp-telefono','sp-email',
   'sp-instagram','sp-facebook','sp-web','sp-img-url'].forEach(id => {
    document.getElementById(id).value = '';
  });
  fileInput.value = '';
  clearImagePreview();
});

// ── INIT ─────────────────────────────────────
loadSponsors();