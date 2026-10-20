# Motion

Quatro peças de vídeo feitas a partir das fotos do site. São animatics: o
ritmo, a ordem e as transições estão resolvidos, mas as imagens são as
versões web de `images/` (no máximo 1600px de largura) e não há som. Para a
versão final, trocar pelas fotos originais em alta e acrescentar a trilha.

| Arquivo | Formato | Duração |
|---|---|---|
| `videos/1-por-um-fio.mp4` | 1280x720 | 31s |
| `videos/2-trinta-anos.mp4` | 1080x1920, Reels | 27s |
| `videos/3a-agua-loop.mp4`, `3b-rede-loop.mp4`, `3c-neon-loop.mp4` | tamanho da foto | loop de 6s |
| `videos/4-quarto-prototipo.mp4` | 1280x720 | 19s |

**1. Por um fio.** Um fio marsala atravessa o filme. Cada foto nasce dele e
volta para ele, em ordem cronológica, e no fim ele desenha o logo. É o
argumento do site, o mesmo olhar do conceito à operação, virando imagem.

**2. Trinta anos.** Um contador rola de 1997 a 2026 e para em cada marco da
trajetória. As fotos abrem a partir do fio, os recortes do New York Times e
da Casa Claudia entram como papel.

**3. Cinemagraphs.** Só uma coisa se mexe em cada quadro: o reflexo na
lâmina d'água, a rede, o neon. O movimento é simulado sobre foto parada. Com
filmagem real, 20 segundos de tripé por plano, o resultado é bem melhor.

**4. Quarto-protótipo.** Storyboard animado do plano a filmar: o quarto em
planta, vista de cima, montado peça por peça em ritmo de stop-motion, e a
foto do quarto pronto do Zank no fim.

## Regras de marca usadas

- Marsala em um elemento por quadro: o fio, o logo ou a numeração de ordem.
- Títulos em serifa (Cormorant Garamond), rótulos em sans fina caixa alta
  espacejada (Jost 300). As duas são de licença aberta, ver `src/fonts/OFL-*`.
- Movimento lento, sem corte seco. Fecha sempre no branco.

## Como gerar de novo

Precisa de Node com Playwright, Chromium, ffmpeg, e Python com numpy e
Pillow. Os HTML leem as fotos de `../../images/`, então o servidor sobe na
raiz do repositório.

```sh
npx http-server . -p 8765 -s &
cd motion/src
node render.js http://127.0.0.1:8765/motion/src/fio.html ../videos/1-por-um-fio.mp4 31
node render.js http://127.0.0.1:8765/motion/src/trinta.html ../videos/2-trinta-anos.mp4 27 1080 1920 30
node render.js http://127.0.0.1:8765/motion/src/quarto.html ../videos/4-quarto-prototipo.mp4 19
python3 cinemagraph.py ../../images ../videos
```

`render.js` chama `window.seek(t)` quadro a quadro e passa cada captura para
o ffmpeg, então o vídeo não depende da velocidade da máquina. Para ajustar
tempos, abrir o HTML no navegador e chamar `seek()` no console.
