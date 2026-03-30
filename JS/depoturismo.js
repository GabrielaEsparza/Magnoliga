(function () {
  const userMedia = [];
  const grid = document.getElementById("user-media-grid");
  const addCol = document.getElementById("add-card-col");
  const addPhotoCol = document.getElementById("add-photo-col");
  const dropzone = document.getElementById("dropzone");
  const photoDropzone = document.getElementById("photo-dropzone");
  const form = document.getElementById("addMediaForm");
  const photoForm = document.getElementById("addPhotoForm");
  const titleInput = document.getElementById("mediaTitle");
  const urlInput = document.getElementById("mediaUrl");
  const descInput = document.getElementById("mediaDesc");
  const photoTitleInput = document.getElementById("photoTitle");
  const photoDescInput = document.getElementById("photoDesc");
  const photoModalInput = document.getElementById("photo-modal-input");
  const photoPreviewImg = document.getElementById("photo-preview-img");
  const photoPreviewPlaceholder = document.getElementById("photo-preview-placeholder");
  let modal, photoModal;
  let pendingPhotoDataUrl = null;

  document.addEventListener("DOMContentLoaded", function () {
    modal = new bootstrap.Modal(document.getElementById("addMediaModal"));
    photoModal = new bootstrap.Modal(document.getElementById("addPhotoModal"));
  });

  /* Helpers */
  function getYouTubeId(url) {
    const m = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
    );
    return m ? m[1] : null;
  }

  function isImageUrl(url) {
    return /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url);
  }

  /* Render */
  function renderMedia() {
    grid.querySelectorAll(".user-card-col").forEach(function (el) {
      el.remove();
    });

    userMedia.forEach(function (item, idx) {
      var col = document.createElement("div");
      col.className = "col-md-6 user-card-col";

      var mediaHtml;
      if (item.type === "photo") {
        mediaHtml =
          '<img src="' + item.dataUrl + '" alt="' + item.title +
          '" class="card-img-top gallery-img" style="object-fit:cover;" loading="lazy" />';
      } else {
        var ytId = getYouTubeId(item.url);
        if (ytId) {
          mediaHtml =
            '<div class="ratio ratio-16x9"><iframe src="https://www.youtube.com/embed/' +
            ytId + '" title="' + item.title + '" allowfullscreen></iframe></div>';
        } else if (isImageUrl(item.url)) {
          mediaHtml =
            '<img src="' + item.url + '" alt="' + item.title +
            '" class="card-img-top gallery-img" style="object-fit:cover;" loading="lazy" />';
        } else {
          mediaHtml =
            '<video src="' + item.url +
            '" controls class="w-100 gallery-img" style="object-fit:cover;"></video>';
        }
      }

      var descHtml = item.desc
        ? '<p class="card-desc px-3 pb-2 mb-0">' + item.desc + '</p>'
        : '';

      col.innerHTML =
        '<div class="card bg-card border-0 overflow-hidden user-card">' +
        '<button class="remove-btn" data-idx="' + idx + '"><i class="bi bi-x-lg"></i></button>' +
        mediaHtml +
        '<div class="card-body py-2 px-3"><p class="text-white small mb-0 fw-medium">' + item.title + '</p></div>' +
        descHtml +
        '</div>';

      grid.insertBefore(col, addCol);
    });

    grid.querySelectorAll(".remove-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        userMedia.splice(parseInt(this.dataset.idx), 1);
        renderMedia();
      });
    });
  }

  /* Dropzone — video */
  dropzone.addEventListener("click", function () {
    urlInput.value = "";
    titleInput.value = "";
    descInput.value = "";
    modal.show();
  });

  dropzone.addEventListener("dragover", function (e) {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });

  dropzone.addEventListener("dragleave", function () {
    dropzone.classList.remove("dragover");
  });

  dropzone.addEventListener("drop", function (e) {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    var text =
      e.dataTransfer.getData("text/plain") ||
      e.dataTransfer.getData("text/uri-list");
    if (text) {
      urlInput.value = text;
      titleInput.value = "";
      descInput.value = "";
      modal.show();
    }
  });

  /* Dropzone — foto */
  photoDropzone.addEventListener("click", function () {
    pendingPhotoDataUrl = null;
    photoTitleInput.value = "";
    photoDescInput.value = "";
    photoPreviewImg.classList.add("d-none");
    photoPreviewImg.src = "";
    photoPreviewPlaceholder.classList.remove("d-none");
    photoModal.show();
  });

  /* Preview box dentro del modal */
  document.getElementById("photo-preview-box").addEventListener("click", function () {
    photoModalInput.click();
  });

  photoModalInput.addEventListener("change", function () {
    var file = this.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      pendingPhotoDataUrl = e.target.result;
      photoPreviewImg.src = pendingPhotoDataUrl;
      photoPreviewImg.classList.remove("d-none");
      photoPreviewPlaceholder.classList.add("d-none");
    };
    reader.readAsDataURL(file);
  });

  /* Form submit — video */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var title = titleInput.value.trim();
    var url = urlInput.value.trim();
    var desc = descInput.value.trim();
    if (title && url) {
      userMedia.push({ type: "video", title: title, url: url, desc: desc });
      renderMedia();
      modal.hide();
      titleInput.value = "";
      urlInput.value = "";
      descInput.value = "";
    }
  });

  /* Form submit — foto */
  photoForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var title = photoTitleInput.value.trim();
    var desc = photoDescInput.value.trim();
    if (title && pendingPhotoDataUrl) {
      userMedia.push({ type: "photo", title: title, dataUrl: pendingPhotoDataUrl, desc: desc });
      renderMedia();
      photoModal.hide();
      photoTitleInput.value = "";
      photoDescInput.value = "";
      pendingPhotoDataUrl = null;
      photoPreviewImg.src = "";
      photoPreviewImg.classList.add("d-none");
      photoPreviewPlaceholder.classList.remove("d-none");
      photoModalInput.value = "";
    }
  });

})();