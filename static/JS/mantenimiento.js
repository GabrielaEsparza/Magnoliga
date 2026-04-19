(function () {
    const userMedia = [];
    const CORREO_DUENO = "dueño@magnoliga.com";

    document.addEventListener("DOMContentLoaded", () => {
        verificarAdmin();
        iniciarAnimaciones();
        setupMediaSystem();
    });

    function verificarAdmin() {
        const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
        const addVideoCol = document.getElementById("add-card-col");
        const addPhotoCol = document.getElementById("add-photo-col");

        if (usuario && usuario.email === CORREO_DUENO) {
            if(addVideoCol) addVideoCol.classList.remove("d-none");
            if(addPhotoCol) addPhotoCol.classList.remove("d-none");
            console.log("Modo editor activado");
        }
    }

    function setupMediaSystem() {
        const grid = document.getElementById("user-media-grid");
        const addCol = document.getElementById("add-card-col");
        const dropzone = document.getElementById("dropzone");
        const photoDropzone = document.getElementById("photo-dropzone");
        
        // Modales
        const modal = new bootstrap.Modal(document.getElementById("addMediaModal"));
        const photoModal = new bootstrap.Modal(document.getElementById("addPhotoModal"));
        let pendingPhotoDataUrl = null;

        // Renderizado de las cards
        function renderMedia() {
            grid.querySelectorAll(".user-card-col").forEach(el => el.remove());
            userMedia.forEach((item, idx) => {
                const col = document.createElement("div");
                col.className = "col-md-6 user-card-col reveal-up";
                
                let mediaContent = item.type === "photo" 
                    ? `<img src="${item.dataUrl}" class="gallery-img w-100">`
                    : `<div class="ratio ratio-16x9"><iframe src="https://www.youtube.com/embed/${getYouTubeId(item.url)}" allowfullscreen></iframe></div>`;

                col.innerHTML = `
                    <div class="card bg-card border-0 h-100 user-card">
                        <button class="remove-btn d-none admin-only" data-idx="${idx}"><i class="bi bi-trash"></i></button>
                        ${mediaContent}
                        <div class="card-body">
                            <h6 class="text-white mb-1">${item.title}</h6>
                            <p class="text-secondary small mb-0">${item.desc || ''}</p>
                        </div>
                    </div>
                `;
                grid.insertBefore(col, addCol);
            });
            
            // Re-checar botones de eliminar si es admin
            const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
            if (usuario && usuario.email === CORREO_DUENO) {
                document.querySelectorAll(".admin-only").forEach(btn => btn.classList.remove("d-none"));
            }

            // Evento para borrar
            document.querySelectorAll(".remove-btn").forEach(btn => {
                btn.onclick = function() {
                    userMedia.splice(this.dataset.idx, 1);
                    renderMedia();
                }
            });
        }

        // Lógica de Foto
        photoDropzone.onclick = () => photoModal.show();
        document.getElementById("photo-modal-input").onchange = function() {
            const reader = new FileReader();
            reader.onload = (e) => {
                pendingPhotoDataUrl = e.target.result;
                document.getElementById("photo-preview-img").src = e.target.result;
                document.getElementById("photo-preview-img").classList.remove("d-none");
                document.getElementById("photo-preview-placeholder").classList.add("d-none");
            };
            reader.readAsDataURL(this.files[0]);
        };

        document.getElementById("submitPhoto").onclick = () => {
            const title = document.getElementById("photoTitle").value;
            if(title && pendingPhotoDataUrl) {
                userMedia.push({type: "photo", title: title, dataUrl: pendingPhotoDataUrl, desc: document.getElementById("photoDesc").value});
                renderMedia();
                photoModal.hide();
            }
        };

        // Lógica de Video
        dropzone.onclick = () => modal.show();
        document.getElementById("submitMedia").onclick = () => {
            const url = document.getElementById("mediaUrl").value;
            const title = document.getElementById("mediaTitle").value;
            if(url && title) {
                userMedia.push({type: "video", title: title, url: url, desc: document.getElementById("mediaDesc").value});
                renderMedia();
                modal.hide();
            }
        };
    }

    function getYouTubeId(url) {
        const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
        return m ? m[1] : null;
    }

    function iniciarAnimaciones() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add("reveal-up");
            });
        }, { threshold: 0.1 });
        document.querySelectorAll(".reveal-up").forEach(el => observer.observe(el));
    }
})();