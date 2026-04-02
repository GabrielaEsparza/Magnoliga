const initialSponsors = [
  {
    id: 1,
    nombre: "Dogos Oscarin",
    categoria: "Alimentos y Bebidas",
    desc: "Los mejores hot dogs de Guadalajara",
    nivel: "Oro",
    img: ""
  },
  {
    id: 2,
    nombre: "GTI Automotors",
    categoria: "Automotriz",
    desc: "Servicio automotriz de excelencia",
    nivel: "Oro",
    img: ""
  },
  {
    id: 3,
    nombre: "Moda Dental",
    categoria: "Salud",
    desc: "Cuidado dental profesional",
    nivel: "Oro",
    img: ""
  },
  {
    id: 4,
    nombre: "PowerSports GDL",
    categoria: "Deportes",
    desc: "Equipamiento deportivo profesional",
    nivel: "Plata",
    img: ""
  },
  {
    id: 5,
    nombre: "FitZone",
    categoria: "Salud y Fitness",
    desc: "Tu gimnasio de confianza",
    nivel: "Plata",
    img: ""
  },
  {
    id: 6,
    nombre: "Prime Drinks",
    categoria: "Bebidas",
    desc: "Hidratación para campeones",
    nivel: "Bronce",
    img: ""
  },
  {
    id: 7,
    nombre: "SneakerZone",
    categoria: "Calzado",
    desc: "Las mejores zapatillas deportivas",
    nivel: "Bronce",
    img: ""
  }
];
 
// ===== Estado =====
let sponsors = JSON.parse(localStorage.getItem('magnoliga_sponsors')) || initialSponsors;
let nextId = sponsors.length ? Math.max(...sponsors.map(s => s.id)) + 1 : 1;
let currentFilter = 'all';
let pendingImageData = null; // base64 de imagen subida
 
// ===== Guardar en localStorage =====
function saveSponsors() {
  localStorage.setItem('magnoliga_sponsors', JSON.stringify(sponsors));
}
 
// ===== Render grid =====
function renderSponsors() {
  const grid = document.getElementById('sponsors-grid');
  const filtered = currentFilter === 'all'
    ? sponsors
    : sponsors.filter(s => s.nivel === currentFilter);
 
  if (!filtered.length) {
    grid.innerHTML = `
      <div class="col-12 empty-state">
        <i class="bi bi-shield-x d-block"></i>
        <p class="mb-0">No hay patrocinadores en este nivel aún.</p>
      </div>`;
    return;
  }
 
  grid.innerHTML = filtered.map((s, i) => `
    <div class="col-md-6 col-lg-3 sponsor-col" style="animation-delay:${i * 0.07}s" data-id="${s.id}">
      <div class="sponsor-card" onclick="viewSponsor(${s.id})">
        <button class="btn-delete-sponsor" onclick="deleteSponsor(event, ${s.id})" title="Eliminar">
          <i class="bi bi-trash3"></i>
        </button>
        <div class="sponsor-img-wrap">
          ${s.img
            ? `<img src="${s.img}" alt="${s.nombre}" loading="lazy" />`
            : `<div class="sponsor-img-placeholder"><i class="bi bi-building"></i></div>`
          }
          <span class="nivel-badge ${s.nivel.toLowerCase()}">${s.nivel}</span>
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
 
  document.getElementById('view-nombre').textContent = s.nombre;
  document.getElementById('view-img').src = s.img || '';
  document.getElementById('view-img').style.display = s.img ? 'block' : 'none';
  document.getElementById('view-categoria').textContent = s.categoria;
  document.getElementById('view-desc').textContent = s.desc;
 
  const badge = document.getElementById('view-nivel-badge');
  badge.textContent = s.nivel;
  badge.className = `badge badge-${s.nivel.toLowerCase()} px-3 py-1`;
 
  new bootstrap.Modal(document.getElementById('viewSponsorModal')).show();
}
 
// ===== Eliminar =====
function deleteSponsor(e, id) {
  e.stopPropagation();
  if (!confirm('¿Eliminar este patrocinador?')) return;
  sponsors = sponsors.filter(s => s.id !== id);
  saveSponsors();
  renderSponsors();
}
 
// ===== Filtros =====
document.getElementById('filtros').addEventListener('click', e => {
  const btn = e.target.closest('.btn-filter');
  if (!btn) return;
  document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentFilter = btn.dataset.filter;
  renderSponsors();
});
 
// ===== Formulario agregar =====
const form = document.getElementById('addSponsorForm');
 
form.addEventListener('submit', e => {
  e.preventDefault();
 
  const nombre    = document.getElementById('sp-nombre').value.trim();
  const categoria = document.getElementById('sp-categoria').value.trim();
  const desc      = document.getElementById('sp-desc').value.trim();
  const nivel     = document.getElementById('sp-nivel').value;
  const imgUrl    = document.getElementById('sp-img-url').value.trim();
 
  if (!nombre || !categoria || !desc || !nivel) return;
 
  const imgFinal = pendingImageData || imgUrl || '';
 
  sponsors.push({ id: nextId++, nombre, categoria, desc, nivel, img: imgFinal });
  saveSponsors();
 
  // Reset form
  form.reset();
  clearImagePreview();
  bootstrap.Modal.getInstance(document.getElementById('addSponsorModal')).hide();
 
  // Si el filtro activo coincide o es "all", re-render
  renderSponsors();
});
 
// ===== Preview imagen =====
const btnUpload      = document.getElementById('btn-upload-img');
const fileInput      = document.getElementById('sp-img-file');
const imgUrlInput    = document.getElementById('sp-img-url');
const previewBox     = document.getElementById('img-preview-container');
const previewImg     = document.getElementById('sp-img-preview');
const btnRemoveImg   = document.getElementById('btn-remove-img');
 
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
  if (url) {
    pendingImageData = null;
    showPreview(url);
  } else {
    clearImagePreview();
  }
});
 
btnRemoveImg.addEventListener('click', () => {
  clearImagePreview();
  imgUrlInput.value = '';
  fileInput.value = '';
});
 
function showPreview(src) {
  previewImg.src = src;
  previewBox.style.display = 'block';
}
 
function clearImagePreview() {
  pendingImageData = null;
  previewImg.src = '';
  previewBox.style.display = 'none';
}
 
// Limpiar preview al cerrar modal
document.getElementById('addSponsorModal').addEventListener('hidden.bs.modal', () => {
  form.reset();
  clearImagePreview();
  fileInput.value = '';
});
 
// ===== Init =====
renderSponsors();