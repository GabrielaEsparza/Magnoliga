const initialSponsors = [
  { id: 1, nombre: "Dogos Oscarin",   categoria: "Alimentos y Bebidas", desc: "Los mejores hot dogs de Guadalajara",   img: "", telefono: "", email: "", instagram: "", facebook: "", web: "" },
  { id: 2, nombre: "GTI Automotors",  categoria: "Automotriz",          desc: "Servicio automotriz de excelencia",     img: "", telefono: "", email: "", instagram: "", facebook: "", web: "" },
  { id: 3, nombre: "Moda Dental",     categoria: "Salud",               desc: "Cuidado dental profesional",            img: "", telefono: "", email: "", instagram: "", facebook: "", web: "" },
  { id: 4, nombre: "PowerSports GDL", categoria: "Deportes",            desc: "Equipamiento deportivo profesional",    img: "", telefono: "", email: "", instagram: "", facebook: "", web: "" },
  { id: 5, nombre: "FitZone",         categoria: "Salud y Fitness",     desc: "Tu gimnasio de confianza",              img: "", telefono: "", email: "", instagram: "", facebook: "", web: "" },
  { id: 6, nombre: "Prime Drinks",    categoria: "Bebidas",             desc: "Hidratación para campeones",            img: "", telefono: "", email: "", instagram: "", facebook: "", web: "" },
  { id: 7, nombre: "SneakerZone",     categoria: "Calzado",             desc: "Las mejores zapatillas deportivas",     img: "", telefono: "", email: "", instagram: "", facebook: "", web: "" }
];

let sponsors = JSON.parse(localStorage.getItem('magnoliga_sponsors')) || initialSponsors;
let nextId = sponsors.length ? Math.max(...sponsors.map(s => s.id)) + 1 : 1;
let pendingImageData = null;
let editPendingImageData = null;

function saveSponsors() {
  localStorage.setItem('magnoliga_sponsors', JSON.stringify(sponsors));
}

// ===== Render =====
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

  grid.innerHTML = sponsors.map((s, i) => `
    <div class="col-md-6 col-lg-3 sponsor-col" style="animation-delay:${i * 0.07}s">
      <div class="sponsor-card" onclick="viewSponsor(${s.id})">

        <button class="btn-delete-sponsor" onclick="deleteSponsor(event,${s.id})" title="Eliminar">
          <i class="bi bi-trash3"></i>
        </button>
        <button class="btn-edit-sponsor" onclick="openEditModal(event,${s.id})" title="Editar">
          <i class="bi bi-pencil"></i>
        </button>

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
    </div>
  `).join('');
}

// ===== Ver patrocinador =====
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

  // Teléfono
  const telRow = document.getElementById('view-telefono-row');
  if (s.telefono) {
    document.getElementById('view-telefono').textContent = s.telefono;
    document.getElementById('view-telefono').href = `https://wa.me/${s.telefono.replace(/\D/g,'')}`;
    telRow.classList.remove('d-none');
  } else { telRow.classList.add('d-none'); }

  // Email
  const emailRow = document.getElementById('view-email-row');
  if (s.email) {
    document.getElementById('view-email').textContent = s.email;
    document.getElementById('view-email').href = `mailto:${s.email}`;
    emailRow.classList.remove('d-none');
  } else { emailRow.classList.add('d-none'); }

  // Instagram — solo icono grande con link
  const igEl = document.getElementById('view-instagram');
  if (s.instagram) {
    const handle = s.instagram.startsWith('@') ? s.instagram.slice(1) : s.instagram;
    igEl.href = `https://instagram.com/${handle}`;
    igEl.classList.remove('d-none');
  } else { igEl.classList.add('d-none'); }

  new bootstrap.Modal(document.getElementById('viewSponsorModal')).show();
}

// ===== Editar =====
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
  document.getElementById('edit-sp-img-url').value   = (!s.img || s.img.startsWith('data:')) ? '' : s.img;

  const editPreviewContainer = document.getElementById('edit-img-preview-container');
  const editPreviewImg       = document.getElementById('edit-sp-img-preview');
  if (s.img) {
    editPreviewImg.src = s.img;
    editPreviewContainer.style.display = 'block';
  } else {
    editPreviewContainer.style.display = 'none';
  }

  new bootstrap.Modal(document.getElementById('editSponsorModal')).show();
}

document.getElementById('saveEditSponsor').addEventListener('click', () => {
  const id        = parseInt(document.getElementById('edit-sp-id').value);
  const nombre    = document.getElementById('edit-sp-nombre').value.trim();
  const categoria = document.getElementById('edit-sp-categoria').value.trim();
  const desc      = document.getElementById('edit-sp-desc').value.trim();
  if (!nombre || !categoria || !desc) return;

  const imgUrl   = document.getElementById('edit-sp-img-url').value.trim();
  const existing = sponsors.find(x => x.id === id);
  const imgFinal = editPendingImageData || imgUrl ||
    (existing?.img?.startsWith('data:') ? existing.img : '');

  sponsors = sponsors.map(s => s.id === id ? {
    ...s, nombre, categoria, desc,
    telefono:  document.getElementById('edit-sp-telefono').value.trim(),
    email:     document.getElementById('edit-sp-email').value.trim(),
    instagram: document.getElementById('edit-sp-instagram').value.trim(),
    facebook:  document.getElementById('edit-sp-facebook').value.trim(),
    web:       document.getElementById('edit-sp-web').value.trim(),
    img:       imgFinal
  } : s);

  saveSponsors();
  bootstrap.Modal.getInstance(document.getElementById('editSponsorModal')).hide();
  renderSponsors();
});

document.getElementById('edit-btn-upload-img').addEventListener('click', () => {
  document.getElementById('edit-sp-img-file').click();
});
document.getElementById('edit-sp-img-file').addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    editPendingImageData = ev.target.result;
    document.getElementById('edit-sp-img-preview').src = editPendingImageData;
    document.getElementById('edit-img-preview-container').style.display = 'block';
    document.getElementById('edit-sp-img-url').value = '';
  };
  reader.readAsDataURL(file);
});
document.getElementById('edit-btn-remove-img').addEventListener('click', () => {
  editPendingImageData = null;
  document.getElementById('edit-sp-img-preview').src = '';
  document.getElementById('edit-img-preview-container').style.display = 'none';
  document.getElementById('edit-sp-img-url').value = '';
  document.getElementById('edit-sp-img-file').value = '';
});

// ===== Eliminar =====
function deleteSponsor(e, id) {
  e.stopPropagation();
  if (!confirm('¿Eliminar este patrocinador?')) return;
  sponsors = sponsors.filter(s => s.id !== id);
  saveSponsors();
  renderSponsors();
}

// ===== Preview imagen (agregar) =====
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
  const reader = new FileReader();
  reader.onload = ev => {
    pendingImageData = ev.target.result;
    showPreview(ev.target.result);
    imgUrlInput.value = '';
  };
  reader.readAsDataURL(file);
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

// ===== Agregar =====
document.getElementById('submitSponsor').addEventListener('click', () => {
  const nombre    = document.getElementById('sp-nombre').value.trim();
  const categoria = document.getElementById('sp-categoria').value.trim();
  const desc      = document.getElementById('sp-desc').value.trim();
  if (!nombre || !categoria || !desc) return;

  sponsors.push({
    id: nextId++, nombre, categoria, desc,
    img:       pendingImageData || document.getElementById('sp-img-url').value.trim() || '',
    telefono:  document.getElementById('sp-telefono').value.trim(),
    email:     document.getElementById('sp-email').value.trim(),
    instagram: document.getElementById('sp-instagram').value.trim(),
    facebook:  document.getElementById('sp-facebook').value.trim(),
    web:       document.getElementById('sp-web').value.trim(),
  });

  saveSponsors();
  bootstrap.Modal.getInstance(document.getElementById('addSponsorModal')).hide();
  renderSponsors();
});

document.getElementById('addSponsorModal').addEventListener('hidden.bs.modal', () => {
  ['sp-nombre','sp-categoria','sp-desc','sp-telefono','sp-email',
   'sp-instagram','sp-facebook','sp-web','sp-img-url'].forEach(id => {
    document.getElementById(id).value = '';
  });
  fileInput.value = '';
  clearImagePreview();
});

renderSponsors();