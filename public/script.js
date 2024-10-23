// Función para cargar el carrusel
function loadCarousel() {
  const carouselContent = document.getElementById('carouselContent');
  let content = '';

  data.carousel.forEach((semester, index) => {
    const isActive = index === 0 ? 'active' : ''; // Solo el primer elemento será activo
    content += `
      <div class="carousel-item ${isActive}">
        <div class="row">
          <div class="text-center">
          <h3>${semester.title}</h3>
          <p>${semester.comment}</p>
          </div>
          ${semester.images.map(image => `
            <div class="col-md-4">
              <img src="${image.src}" alt="${image.alt}" width="${image.width}" height="${image.height}" class="d-block w-100">
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });

  // Añadir el contenido generado al carrusel
  carouselContent.innerHTML = content;
}

// Llamar a la función para cargar el carrusel cuando el documento esté listo
document.addEventListener('DOMContentLoaded', loadCarousel);
