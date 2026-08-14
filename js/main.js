// Rolagem suave apenas quando a âncora existe na página atual
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

// Sombra da navegação ao rolar.
// O listener é passivo para não bloquear a rolagem, e a troca de classe é
// agrupada num requestAnimationFrame — o handler dispara dezenas de vezes por
// segundo, mas só há um repinte por quadro para aproveitar.
// Precisa da classe: querySelector('nav') pegaria tambem o <nav> do rodape
// se um dia ele viesse antes na marcacao.
const nav = document.querySelector('.nav-principal');

if (nav) {
    let agendado = false;

    window.addEventListener('scroll', () => {
        if (agendado) return;
        agendado = true;
        requestAnimationFrame(() => {
            nav.classList.toggle('nav-scrolled', window.scrollY > 50);
            agendado = false;
        });
    }, { passive: true });
}
