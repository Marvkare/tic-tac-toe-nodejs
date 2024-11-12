const carouselsData = [
    {
        id: 'carousel1',
        images: [
            { src: 'img/imagen1.jpg', alt: 'Imagen 1' },
            { src: 'img/imagen2.png', alt: 'Imagen 2' },
            { src: 'img/imagen3.png', alt: 'Imagen 3' },
            { src: 'img/imagen3.png', alt: 'Imagen 3' },
        ],
    },
    {
        id: 'carousel2',
        images: [
            { src: 'img/programacion.jpg', alt: 'Imagen 4' },
            { src: 'img/kgisado.jpg', alt: 'Imagen 5' },
            { src: 'img/graficacion_axol.gif', alt: 'Imagen 6' },
        ],
    },
];

carouselsData.forEach(carouselData => {
    const carousel = document.getElementById(carouselData.id);
    
    const carouselImages = document.createElement('div');
    carouselImages.classList.add('carousel-images');

    carouselData.images.forEach(image => {
        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.alt;
        img.classList.add('carousel-image');
        carouselImages.appendChild(img);
    });

    carousel.appendChild(carouselImages);

    const controls = document.createElement('div');
    controls.classList.add('carousel-controls');
    
    const prevButton = document.createElement('button');
    prevButton.classList.add('carousel-button');
    prevButton.textContent = '<';
    controls.appendChild(prevButton);

    const nextButton = document.createElement('button');
    nextButton.classList.add('carousel-button');
    nextButton.textContent = '>';
    controls.appendChild(nextButton);

    carousel.appendChild(controls);

    const counter = document.createElement('div');
    counter.classList.add('counter');
    counter.textContent = `1 / ${carouselData.images.length}`;
    carousel.appendChild(counter);

    let currentIndex = 0;

    prevButton.addEventListener('click', () => {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : carouselData.images.length - 1;
        updateCarousel();
    });

    nextButton.addEventListener('click', () => {
        currentIndex = (currentIndex < carouselData.images.length - 1) ? currentIndex + 1 : 0;
        updateCarousel();
    });

    function updateCarousel() {
        carouselImages.style.transform = `translateX(-${currentIndex * 100}%)`;
        counter.textContent = `${currentIndex + 1} / ${carouselData.images.length}`;
    }
});