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

// Cinemagraph do topo da home.
// A foto parada já está na página. O vídeo só é criado aqui, e só quando o
// movimento é bem-vindo: quem pediu menos movimento no sistema, ou ativou a
// economia de dados, fica com a foto e não baixa nada. Ele entra transparente
// e aparece quando começa a tocar, para não piscar preto por cima da foto, e
// pausa fora da tela para não gastar bateria rodando onde ninguém vê.
const midia = document.querySelector('.hero-midia[data-video]');
const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const poupaDados = navigator.connection && navigator.connection.saveData;

if (midia && !semMovimento && !poupaDados) {
    const video = document.createElement('video');
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.setAttribute('aria-hidden', 'true');
    // MP4 primeiro, que toca em quase tudo; o WebM cobre o Chromium sem H.264.
    // O navegador fica com a primeira fonte que sabe tocar.
    for (const [ext, tipo] of [['mp4', 'video/mp4'], ['webm', 'video/webm']]) {
        const fonte = document.createElement('source');
        fonte.src = `${midia.dataset.video}.${ext}`;
        fonte.type = tipo;
        video.appendChild(fonte);
    }
    video.addEventListener('playing', () => video.classList.add('tocando'), { once: true });
    midia.querySelector('.hero-quadro').appendChild(video);

    // play() devolve uma promessa que é rejeitada quando o navegador bloqueia
    // a reprodução automática. Nesse caso a foto continua ali, sem erro.
    const tocar = () => video.play().catch(() => {});

    if ('IntersectionObserver' in window) {
        new IntersectionObserver(([entrada]) => {
            if (entrada.isIntersecting) tocar();
            else video.pause();
        }).observe(midia);
    } else {
        tocar();
    }
}
