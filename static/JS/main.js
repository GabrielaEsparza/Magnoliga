document.addEventListener("DOMContentLoaded", () => { 

  // navbar
  fetch("/static/componentes/navbar.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("navbar").innerHTML = data;

      // Scroll: fondo al bajar
      const navbar = document.querySelector('.navbar');
      window.addEventListener('scroll', () => {
        navbar.style.background = window.scrollY > 60 
          ? 'rgba(10, 10, 10, 0.95)' 
          : 'transparent';
      });

      // Hamburguesa
      const toggle = document.getElementById('navbarToggle');
      const menu = document.getElementById('navMenu');
      if (toggle && menu) {
        toggle.addEventListener('click', () => {
          toggle.classList.toggle('open');
          menu.classList.toggle('open');
        });
        menu.querySelectorAll('a').forEach(link => {
          link.addEventListener('click', () => {
            toggle.classList.remove('open');
            menu.classList.remove('open');
          });
        });
      }
    });

  // footer
  const footerContainer = document.getElementById("footer");
  if (footerContainer) {
    fetch("/static/componentes/footer.html") 
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
