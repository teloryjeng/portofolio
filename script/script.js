document.addEventListener('DOMContentLoaded', () => {

    // Smooth Scroll for Navigation and Buttons
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Header offset
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add clean fade-in animations on scroll
    const observerOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                scrollObserver.unobserve(entry.target); // Animates once
            }
        });
    }, observerOptions);

    // Apply observer to fade-in elements (Home and About pages)
    const fadeElements = document.querySelectorAll(
        '.project-card, .about-description, .collaborate-title, .collaborate-subtitle, .about-main-desc, .story-row, .project-quote'
    );
    
    // Add CSS initial state class and observe
    fadeElements.forEach(el => {
        el.classList.add('fade-in-element');
        scrollObserver.observe(el);
    });

    // Image Protection: Prevent right-click menu and dragging on all images
    document.addEventListener('contextmenu', (e) => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
        }
    });

    document.addEventListener('dragstart', (e) => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
        }
    });
});

// Inject initial style for scroll animation directly to avoid style.css bloat
const style = document.createElement('style');
style.innerHTML = `
    .fade-in-element {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1), transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
    }
    .fade-in-element.visible {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);
