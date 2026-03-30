document.addEventListener("DOMContentLoaded", () => { 
  const footerContainer = document.getElementById("footer");
  console.log("Buscando contenedor footer..."); // Depuración

  if (footerContainer) {
    fetch("./componentes/footer.html") 
      .then((res) => {
        if (!res.ok) throw new Error("Error: " + res.status);
        return res.text();
      })
      .then((html) => {
        console.log("Footer cargado con éxito"); // Depuración
        footerContainer.innerHTML = html; 
      })
      .catch((err) => console.error("Error al cargar el footer:", err));
  } else {
    console.error("No se encontró el elemento con id='footer'");
  }
});