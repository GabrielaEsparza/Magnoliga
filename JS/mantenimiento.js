document.addEventListener("DOMContentLoaded", () => {
    verificarPermisos();
    iniciarAnimaciones();
});

function verificarPermisos() {
    const adminSection = document.getElementById("admin-controls");
    const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));

    // AQUÍ DEFINES QUIÉN ES EL DUEÑO
    // Cambia "dueño@magnoliga.com" por el correo real del cliente
    const CORREO_DUENO = "dueño@magnoliga.com"; 

    if (usuario && usuario.email === CORREO_DUENO) {
        adminSection.classList.remove("d-none");
        console.log("Acceso de administrador concedido");
    } else {
        console.log("Acceso de solo lectura");
    }
}

function iniciarAnimaciones() {
    // Si quieres que las cosas aparezcan conforme haces scroll
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("reveal-up");
            }
        });
    }, observerOptions);

    document.querySelectorAll(".reveal-up").forEach(el => observer.observe(el));
}