(function () {
  const userMedia = [];

  /* ── Helpers ── */
  function getYouTubeId(url) {
    const m = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
    );
    return m ? m[1] : null;
  }

  function isImageUrl(url) {
    return /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url);
  }

  document.addEventListener("DOMContentLoaded", function () {

    /* ── Referencias ── */
    const grid          = document.getElementById("user-media-grid");
    const addCol        = document.getElementById("add-card-col");
    const dropzone      = document.getElementById("dropzone");
    const photoDropzone = document.getElementById("photo-dropzone");

    const titleInput    = document.getElementById("mediaTitle");
    const urlInput      = document.getElementById("mediaUrl");
    const descInput     = document.getElementById("mediaDesc");

    const photoTitleInput         = document.getElementById("photoTitle");
    const photoDescInput          = document.getElementById("photoDesc");
    const photoModalInput         = document.getElementById("photo-modal-input");
    const photoPreviewImg         = document.getElementById("photo-preview-img");
    const photoPreviewPlaceholder = document.getElementById("photo-preview-placeholder");

    /* ── Modales ── */
    const modal      = new bootstrap.Modal(document.getElementById("addMediaModal"));
    const photoModal = new bootstrap.Modal(document.getElementById("addPhotoModal"));

    let pendingPhotoDataUrl = null;

    /* ── Render ── */
    function renderMedia() {
      grid.querySelectorAll(".user-card-col").forEach(el => el.remove());

      userMedia.forEach((item, idx) => {
        const col = document.createElement("div");
        col.className = "col-md-6 user-card-col";

        let mediaHtml;

        if (item.type === "photo") {
          mediaHtml = `<img src="${item.dataUrl}" class="card-img-top gallery-img">`;
        } else {
          const ytId = getYouTubeId(item.url);
          if (ytId) {
            mediaHtml = `
              <div class="ratio ratio-16x9">
                <iframe src="https://www.youtube.com/embed/${ytId}" allowfullscreen></iframe>
              </div>`;
          } else if (isImageUrl(item.url)) {
            mediaHtml = `<img src="${item.url}" class="card-img-top gallery-img">`;
          } else {
            mediaHtml = `<video src="${item.url}" controls class="w-100"></video>`;
          }
        }

        const descHtml = item.desc
          ? `<p class="card-desc px-3 pb-2 mb-0">${item.desc}</p>`
          : "";

        col.innerHTML = `
          <div class="card bg-card border-0 overflow-hidden user-card">
            <button class="remove-btn" data-idx="${idx}"><i class="bi bi-x-lg"></i></button>
            ${mediaHtml}
            <div class="card-body py-2 px-3">
              <p class="text-white small mb-0 fw-medium">${item.title}</p>
            </div>
            ${descHtml}
          </div>
        `;

        grid.insertBefore(col, addCol);
      });

      document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", function () {
          userMedia.splice(parseInt(this.dataset.idx), 1);
          renderMedia();
        });
      });
    }

    /* ── Video ── */
    dropzone.addEventListener("click", () => {
      titleInput.value = "";
      urlInput.value   = "";
      descInput.value  = "";
      modal.show();
    });

    document.getElementById("submitMedia").addEventListener("click", () => {
      const title = titleInput.value.trim();
      const url   = urlInput.value.trim();
      const desc  = descInput.value.trim();

      if (title && url) {
        userMedia.push({ type: "video", title, url, desc });
        renderMedia();
        modal.hide();
      }
    });

    /* ── Foto ── */
    photoDropzone.addEventListener("click", () => {
      pendingPhotoDataUrl = null;
      photoTitleInput.value = "";
      photoDescInput.value  = "";
      photoPreviewImg.classList.add("d-none");
      photoPreviewPlaceholder.classList.remove("d-none");
      photoModal.show();
    });

    document.getElementById("photo-preview-box").addEventListener("click", () => {
      photoModalInput.click();
    });

    photoModalInput.addEventListener("change", function () {
      const file = this.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (e) {
        pendingPhotoDataUrl = e.target.result;
        photoPreviewImg.src = pendingPhotoDataUrl;
        photoPreviewImg.classList.remove("d-none");
        photoPreviewPlaceholder.classList.add("d-none");
      };
      reader.readAsDataURL(file);
    });

    document.getElementById("submitPhoto").addEventListener("click", () => {
      const title = photoTitleInput.value.trim();
      const desc  = photoDescInput.value.trim();

      if (title && pendingPhotoDataUrl) {
        userMedia.push({ type: "photo", title, dataUrl: pendingPhotoDataUrl, desc });
        renderMedia();
        photoModal.hide();
      }
    });

  });

})();