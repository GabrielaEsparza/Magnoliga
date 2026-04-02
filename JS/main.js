document.addEventListener("DOMContentLoaded", () => { 

  // navbar
  fetch("./componentes/navbar.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("navbar").innerHTML = data;

      // ✅ Ahora sí existe el elemento
      const navbar = document.querySelector('.navbar');

      window.addEventListener('scroll', () => {
        navbar.style.background = window.scrollY > 60 
          ? 'rgba(10, 10, 10, 0.95)' 
          : 'transparent';
      });
    });

  // footer
  const footerContainer = document.getElementById("footer");
  if (footerContainer) {
    fetch("./componentes/footer.html") 
      .then((res) => {
        if (!res.ok) throw new Error("Error: " + res.status);
        return res.text();
      })
      .then((html) => {
        footerContainer.innerHTML = html; 
      })
      .catch((err) => console.error("Error al cargar el footer:", err));
  }
});