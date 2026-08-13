// Smooth scrolling only when target anchor exists in current page
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        // scrollIntoView rola mas não move o foco. Sem isto, o preventDefault
        // acima cancela o reposicionamento de foco que o navegador faria, e o
        // link "pular para o conteúdo" deixa de pular: o Tab seguinte volta
        // para o primeiro item da navegação.
        target.focus({ preventScroll: true });
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
