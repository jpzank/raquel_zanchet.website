# Motion

Quatro peças de vídeo feitas com o que já existe: as fotos do site e o
acervo do Jardim da Amazônia. Nada foi filmado para elas. O som também é do
lodge: o ambiente da margem do rio Claro e o canto do tiê-bicudo.

| Arquivo | Formato | Duração | Som |
|---|---|---|---|
| `videos/1-por-um-fio.mp4` | 1280x720 | 31s | ambiente, canto no fecho |
| `videos/2-trinta-anos.mp4` | 1080x1920, Reels | 27s | ambiente, canto quando a ave aparece |
| `videos/3a-agua-loop.mp4`, `3b-rede-loop.mp4`, `3c-neon-loop.mp4` | tamanho da foto | loop de 6s | mudo |
| `videos/3d-canal-loop.mp4` | 1080x1920, Stories | loop de 6s | mudo |
| `videos/4-quarto-prototipo.mp4` | 1280x720 | 19s | ambiente |

**1. Por um fio.** Um fio marsala atravessa o filme. Cada foto nasce dele e
volta para ele, em ordem cronológica, e no fim ele desenha o logo. É o
argumento do site, o mesmo olhar do conceito à operação, virando imagem.

**2. Trinta anos.** Um contador rola de 1997 a 2026 e para em cada marco da
trajetória. As fotos abrem a partir do fio, os recortes do New York Times e
da Casa Claudia entram como papel.

**3. Cinemagraphs.** Só uma coisa se mexe em cada quadro: o reflexo na
lâmina d'água, a rede, o neon, a água do canal da piscina natural. O
movimento é simulado sobre foto parada.

**4. Quarto-protótipo.** O quarto em planta, vista de cima, montado peça por
peça em ritmo de stop-motion, e no fim o quarto pronto do Bangalô Jardim.

## Acervo do Jardim da Amazônia

Os arquivos abaixo vêm do acervo do lodge no Google Drive (biblioteca
`jda-sdata`). Ficam em `src/acervo/`, fora do git, porque este repositório é
público. Todos já estão publicados pelo próprio lodge, no site ou no
LinkedIn.

| Em `src/acervo/` | Arquivo no Drive | Crédito | Usado em |
|---|---|---|---|
| `tie-bicudo-jhonata-araujo.mp4` | `jda-sdata-aves-tie-bicudo-jhonata-araujo-02.mp4` | Jhonata Araujo | canto, filmes 1 e 2 |
| `rio-claro.mp4` | `jda-sdata-videos-video-rio-autor-pendente-01.mp4` | autor pendente no acervo | ambiente, filmes 1, 2 e 4 |
| `bangalo-jardim.jpg` | `jda-sdata-acomodacoes-acom-bangalo-jardim-088-hdr-autor-pendente-01.jpg` | autor pendente no acervo | fecho do filme 4 |
| `canal-piscina.jpg` | `jda-sdata-ambientes-piscina-caminho-reflexo-autor-pendente-01.jpg` | autor pendente no acervo | cinemagraph 3d |

O acervo tem material melhor que não passou: os vídeos de drone e o
tiê-bicudo em 1080p têm de 25MB a 550MB, acima do limite de 10MB do conector
do Drive, e o Cloudinary do lodge não está liberado na rede do ambiente.

## Regras de marca usadas

- Marsala em um elemento por quadro: o fio, o logo ou a numeração de ordem.
- Títulos em serifa (Cormorant Garamond), rótulos em sans fina caixa alta
  espacejada (Jost 300). As duas são de licença aberta, ver `src/fonts/OFL-*`.
- Movimento lento, sem corte seco. Fecha sempre no branco.
- Som do lugar, nunca trilha de banco.

## Como gerar de novo

Precisa de Node com Playwright, Chromium, ffmpeg, bc, e Python com numpy e
Pillow, além do acervo em `src/acervo/`. Os HTML leem as fotos de
`../../images/`, então o servidor sobe na raiz do repositório. Os filmes
saem mudos em `src/mudo/`, e `som.sh` grava a versão com som em `videos/`.

```sh
npx http-server . -p 8765 -s &
cd motion/src
node render.js http://127.0.0.1:8765/motion/src/fio.html mudo/1-por-um-fio.mp4 31
node render.js http://127.0.0.1:8765/motion/src/trinta.html mudo/2-trinta-anos.mp4 27 1080 1920 30
node render.js http://127.0.0.1:8765/motion/src/quarto.html mudo/4-quarto-prototipo.mp4 19
sh som.sh
python3 cinemagraph.py ../../images ../videos            # os quatro loops
python3 cinemagraph.py ../../images ../videos canal      # só um deles
```

`render.js` chama `window.seek(t)` quadro a quadro e passa cada captura para
o ffmpeg, então o vídeo não depende da velocidade da máquina. Para ajustar
tempos, abrir o HTML no navegador e chamar `seek()` no console.
