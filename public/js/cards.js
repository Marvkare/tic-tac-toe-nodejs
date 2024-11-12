const cards = document.querySelectorAll('.fc-card');

cards.forEach(card => {
    card.addEventListener('click', () => {
        card.classList.toggle('flipped'); // Alterna la clase 'flipped'
    });
});

const cards2 = document.querySelectorAll('.card');

cards2.forEach(card => {
    card.addEventListener('click', () => {
        card.classList.toggle('flipped'); // Alterna la clase 'flipped'
    });
});