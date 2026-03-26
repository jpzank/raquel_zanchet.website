// Smooth scrolling only when target anchor exists in current page
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
    });
});

// Navigation menu highlight on scroll
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.classList.add('nav-scrolled');
    } else {
        nav.classList.remove('nav-scrolled');
    }
});

// Contact form handling
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Animate submit button
        const submitBtn = this.querySelector('.submit-btn');
        submitBtn.classList.add('loading');
        
        // Simulate form submission
        setTimeout(() => {
            submitBtn.classList.remove('loading');
            this.style.display = 'none';
            document.getElementById('thankYouMessage').classList.remove('hidden');
        }, 1500);
    });
}

// Project cards hover effect
document.querySelectorAll('.project, .project-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.classList.add('hover');
    });
    
    card.addEventListener('mouseleave', function() {
        this.classList.remove('hover');
    });
});
