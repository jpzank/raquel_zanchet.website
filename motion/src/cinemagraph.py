"""Cinemagraphs a partir das fotos do site: só uma coisa se mexe em cada quadro.

Todos os movimentos têm período que divide o loop (LOOP segundos), então o
último quadro emenda no primeiro sem costura.
"""
import subprocess, sys
import numpy as np
from PIL import Image, ImageFilter

FPS, LOOP = 24, 6.0
N = int(FPS * LOOP)
TAU = 2 * np.pi
IMG = sys.argv[1] if len(sys.argv) > 1 else 'img'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'out'


def load(name, crop=None):
    im = Image.open(f'{IMG}/{name}').convert('RGB')
    if crop:
        im = im.crop(crop)
    return np.asarray(im).astype(np.float32)


def remap(a, dx, dy):
    """Amostragem bilinear de a em (x+dx, y+dy)."""
    h, w, _ = a.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    x = np.clip(xx + dx, 0, w - 1.001)
    y = np.clip(yy + dy, 0, h - 1.001)
    x0, y0 = x.astype(int), y.astype(int)
    fx, fy = (x - x0)[..., None], (y - y0)[..., None]
    return (a[y0, x0] * (1 - fx) * (1 - fy) + a[y0, x0 + 1] * fx * (1 - fy)
            + a[y0 + 1, x0] * (1 - fx) * fy + a[y0 + 1, x0 + 1] * fx * fy)


def blur(m, r):
    im = Image.fromarray(np.clip(m * 255, 0, 255).astype(np.uint8))
    return np.asarray(im.filter(ImageFilter.GaussianBlur(r))).astype(np.float32) / 255


def polymask(shape, pts, feather):
    from PIL import ImageDraw
    h, w = shape
    im = Image.new('L', (w, h), 0)
    ImageDraw.Draw(im).polygon(pts, fill=255)
    return np.asarray(im.filter(ImageFilter.GaussianBlur(feather))).astype(np.float32) / 255


def write(name, frames_fn, size, repeat=3):
    w, h = size
    cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{w}x{h}',
           '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17',
           '-preset', 'slow', '-movflags', '+faststart', f'{OUT}/{name}-loop.mp4']
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for i in range(N):
        p.stdin.write(np.clip(frames_fn(i / N), 0, 255).astype(np.uint8).tobytes())
    p.stdin.close(); p.wait()
    # versão de prévia: o mesmo loop repetido, para ver que a emenda não aparece
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-stream_loop', str(repeat - 1), '-i', f'{OUT}/{name}-loop.mp4',
                    '-c', 'copy', f'{OUT}/{name}-preview.mp4'], check=True)
    print('ok', name)


# --- 1. Lâmina d'água: o reflexo ondula, a luz no fundo raso se mexe. ------
def agua():
    a = load('bem-estar-agua.jpg')
    h, w, _ = a.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    # superfície da água: abaixo da borda da mata e do caminho de pedra
    borda = np.where(xx < 470, 522, 522 + (xx - 470) * (600 - 522) / (w - 470))
    m = np.clip((yy - borda) / 18, 0, 1)
    m *= 1 - polymask((h, w), [(0, 715), (95, 735), (140, 800), (0, 800)], 6)  # pedra do canto
    prof = np.clip((yy - 520) / (h - 520), 0, 1)  # perspectiva: onda maior perto da câmera
    luz = blur(np.clip((a.mean(2) - 120) / 80, 0, 1), 3) * m

    rng = np.random.default_rng(7)
    fase = blur(rng.random((h, w)).astype(np.float32), 18) * TAU * 3

    def f(t):
        ph = TAU * t
        dx = (np.sin(yy / (3 + 9 * prof) + ph * 2 + fase) * (0.6 + 2.6 * prof)
              + np.sin(yy / 23 - xx / 160 + ph * 1 + fase * 0.5) * 1.2 * prof) * m
        dy = np.sin(xx / 40 + yy / 18 + ph * 1 + fase) * 0.5 * prof * m
        out = remap(a, dx, dy)
        caust = (np.sin(xx / 21 + yy / 9 + ph * 2 + fase) * np.sin(xx / 13 - yy / 15 - ph * 1 + fase * 0.7))
        return out * (1 + 0.07 * caust * luz)[..., None]
    write('3a-agua', f, (w, h))


# --- 2. Rede: balança devagar entre os dois troncos. ------------------------
def rede():
    a = load('bem-estar-rede.jpg')
    h, w, _ = a.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    m = polymask((h, w), [(138, 448), (152, 452), (300, 470), (372, 436), (360, 470), (335, 560),
                          (300, 640), (240, 650), (190, 600), (160, 540)], 10)
    # zero nos pontos de amarração, máximo na barriga da rede
    ancora = 450 - (xx - 145) * (450 - 440) / (365 - 145)
    peso = np.clip((yy - ancora) / 190, 0, 1) ** 1.3 * m
    franja = np.clip((yy - 560) / 60, 0, 1) * m

    luz = blur(np.clip((a.mean(2) - 170) / 60, 0, 1), 2) * np.clip((260 - yy) / 260, 0, 1)

    def f(t):
        ph = TAU * t
        dx = np.sin(ph * 2) * 4.5 * peso + np.sin(ph * 2 - 0.9 + xx / 9) * 0.9 * franja
        dy = -np.abs(np.sin(ph * 2)) * 1.0 * peso
        out = remap(a, dx, dy)
        brilho = np.sin(ph * 1 + xx / 30) * np.sin(ph * 2 + yy / 25)
        return out * (1 + 0.06 * brilho * luz)[..., None]
    write('3b-rede', f, (w, h))


# --- 3. Neon: o filete respira, e a luz dele mexe no entorno. ---------------
def neon():
    a = load('card-collab.jpg', crop=(0, 0, 750, 422))
    h, w, _ = a.shape
    g = np.minimum(a[..., 1], a[..., 2])
    m = np.clip((g - 80) / 90, 0, 1)
    halo1, halo2 = blur(m, 4), blur(m, 22)
    entorno = blur(m, 60)

    def nivel(t):
        base = 0.86 + 0.14 * np.cos(TAU * t * 2)          # respiração
        tremor = 0.55 if (0.62 < t < 0.635 or 0.66 < t < 0.672) else 1.0  # duas falhas por loop
        return base * tremor

    def f(t):
        k = nivel(t)
        out = a * (1 + 0.22 * (k - 1) * entorno[..., None] * 4) * (1 - 0.35 * (1 - k) * m[..., None])
        cor = np.array([255, 236, 230], np.float32)
        glow = (halo1 * 0.55 + halo2 * 0.35) * k
        return out + (255 - out) * (glow[..., None] * cor / 255) * 0.9
    write('3c-neon', f, (w, h))


if __name__ == '__main__':
    for fn in (agua, rede, neon):
        fn()
