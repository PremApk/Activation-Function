/* js/ai_concepts.js */

document.addEventListener('DOMContentLoaded', () => {
    const circles = document.querySelectorAll('.circle-container');
    const cards = document.querySelectorAll('.info-card');
    const diagramArea = document.querySelector('.diagram-area');

    function setActive(id) {
        // Remove active class from all
        circles.forEach(c => c.classList.remove('active'));
        cards.forEach(c => c.classList.remove('active'));

        if (!id) return;

        // Add active class to the matched circle and card
        const circle = document.querySelector(`.circle-${id}`);
        const card = document.getElementById(`card-${id}`);

        if (circle) circle.classList.add('active');
        if (card) {
            card.classList.add('active');
            // Ensure card is scrolled into view smoothly
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    // Events for circles
    circles.forEach(circle => {
        circle.addEventListener('mouseenter', (e) => {
            e.stopPropagation(); // Prevent triggering parent circles
            diagramArea.classList.add('is-hovering');
            setActive(circle.dataset.id);
        });

        circle.addEventListener('mouseleave', () => {
            diagramArea.classList.remove('is-hovering');
            setActive(null);
        });
    });

    // Events for cards
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const id = card.id.replace('card-', '');
            diagramArea.classList.add('is-hovering');
            setActive(id);
        });

        card.addEventListener('mouseleave', () => {
            diagramArea.classList.remove('is-hovering');
            setActive(null);
        });
    });
});
