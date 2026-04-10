document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const emailInput = document.getElementById('email').value;
    const passInput = document.getElementById('password').value;

    // Aquí pones el usuario que quieras
    if (emailInput === "atziri@admin.com" && passInput === "12345") {
        localStorage.setItem('usuarioActivo', JSON.stringify({role: 'admin'}));
        window.location.href = "mantenimiento.html";
    } else {
        document.getElementById('errorMessage').classList.remove('d-none');
    }
});