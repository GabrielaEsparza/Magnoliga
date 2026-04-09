document.addEventListener("DOMContentLoaded", () => {
    // Verificar permisos de admin
    verificarAdminJuegos();
});

// Función para mostrar/ocultar los controles de administrador
function verificarAdminJuegos() {
    const CORREO_ENCARGADA = "atziri.berrospe@magnoliga.com";
    const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));

    if (usuario && usuario.email === CORREO_ENCARGADA) {
        document.getElementById("admin-category-actions")?.classList.remove("d-none");
        document.querySelectorAll('.admin-match-actions, .admin-match-btns').forEach(el => el.classList.remove('d-none'));
        console.log("Acceso de administración concedido en Rol de Juegos");
    }
}

// Función para expandir la sección de partidos al dar clic en una categoría
function expandirPartidos(categoriaId) {
    const gridContainer = document.getElementById("categories-grid");
    const matchesSection = document.getElementById("matches-section");
    const expandedTitle = document.getElementById("expanded-cat-title");

    // Ocultar cuadrícula con animación
    gridContainer.style.opacity = "0";
    gridContainer.style.transition = "opacity 0.4s ease";
    
    setTimeout(() => {
        gridContainer.classList.add("d-none");
        
        // Cambiar título de la categoría (esto debería ser dinámico)
        if (categoriaId === 'cat_1') expandedTitle.innerText = "Juegos 3 x 3";
        // ... cargar partidos reales aquí ...

        // Mostrar sección de detalle con animación
        matchesSection.classList.remove("d-none");
        matchesSection.style.opacity = "0";
        
        // Pequeño delay para que la animación reveal-up se note
        setTimeout(() => {
            matchesSection.style.opacity = "1";
            matchesSection.classList.add("reveal-up");
        }, 50);
        
    }, 400); // Mismo tiempo que la animación fadeOut
}

// Función para volver a la cuadrícula de categorías
function cerrarPartidos() {
    const gridContainer = document.getElementById("categories-grid");
    const matchesSection = document.getElementById("matches-section");

    matchesSection.classList.add("d-none");
    matchesSection.classList.remove("reveal-up"); // Resetear animación

    gridContainer.classList.remove("d-none");
    gridContainer.style.opacity = "1";
    gridContainer.classList.add("reveal-up");
}