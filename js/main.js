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
        //
        // focus() só funciona em elemento focável, e <section> não é. O <main>
        // do skip-link já traz tabindex="-1" na marcação, mas as seções do
        // índice de página não, então ali o focus() falhava calado: a página
        // rolava e o Tab seguinte continuava no item seguinte do índice, a
        // meia página de distância do que se estava lendo. O atributo entra
        // aqui, para valer para qualquer âncora que venha depois, e sai no
        // blur para não deixar rastro no DOM.
        if (!target.hasAttribute('tabindex')) {
            target.setAttribute('tabindex', '-1');
            target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
        }
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
