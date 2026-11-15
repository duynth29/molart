#!/usr/bin/env python3
"""Compose the vertical promo video from frames rendered by scripts/promo.mjs.

Top half: the original Đông Hồ print behind the current style (photos/scans in --originals), on điệp paper in a
printed frame with its name, cross-fading into the next one.
Bottom half: the protein spinning in the same style, on the same điệp paper and frame, with the site's address.
1080 x 1920, H.264 (yuv420p, faststart), ready for Instagram Reels.

usage: python3 scripts/promo_compose.py out/promo out/molart-dongho-reel.mp4 [--originals out/originals] [--url ...] [--test]
"""
import argparse
import importlib.util
import json
import re
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('dongho_paper', HERE / 'dongho_paper.py')
paperlib = importlib.util.module_from_spec(spec)
spec.loader.exec_module(paperlib)

W, HALF = 1080, 960
FADE = 7  # frames of cross-fade between prints


def load(p):
    return np.asarray(Image.open(p).convert('RGB'), np.float32) / 255.0


# which original print stands behind each style (several images are shown side by side)
ORIGINALS = {
    'dongho': ['lon_user.png'], 'dongho-ga': ['ga.jpg'], 'dongho-chuot': ['chuot.jpg'], 'dongho-vinhhoa': ['vinhhoa.jpg', 'phuquy.jpg'],
    'dongho-dua': ['dua.jpg'], 'dongho-coc': ['coc.jpg'], 'dongho-batrieu': ['batrieu.jpg'],
}


def trim(im, dark=0.28, light=0.97):
    """Cut away the scanner's mat or the museum frame: edge rows/columns that are almost all very dark or very light."""
    a = np.asarray(im.convert('L'), np.float32) / 255.0
    def bad(v):
        return (v < dark).mean() > 0.6 or (v > light).mean() > 0.9
    t, b, l, r = 0, a.shape[0], 0, a.shape[1]
    while t < b - 10 and bad(a[t, l:r]): t += 1
    while b > t + 10 and bad(a[b - 1, l:r]): b -= 1
    while l < r - 10 and bad(a[t:b, l]): l += 1
    while r > l + 10 and bad(a[t:b, r - 1]): r -= 1
    pad = 4                                            # a hair more, so no dark line is left at the edge
    return im.crop((l + pad, t + pad, r - pad, b - pad))


def original_top(names, title, folder, font, rng):
    """One top half: the original print(s) on điệp paper inside the printed frame, the name in Lạc Tự below."""
    paper = paperlib.paper(HALF, W, rng)
    canvas = Image.new('RGB', (W, HALF), 'white')   # artwork laid out on white, then printed into the paper
    m = HALF // 22 + 4 * max(3, HALF // 220) + 22     # inside the frame
    title_h = 86
    box_w, box_h = W - 2 * m, HALF - 2 * m - title_h
    ims = [trim(Image.open(folder / n).convert('RGB')) for n in names]
    gap = 24
    # scale every image to the same height, then fit the row into the box
    h0 = max(im.height for im in ims)
    ims = [im.resize((round(im.width * h0 / im.height), h0), Image.LANCZOS) for im in ims]
    row_w = sum(im.width for im in ims) + gap * (len(ims) - 1)
    k = min(box_w / row_w, box_h / h0)
    x = m + (box_w - row_w * k) / 2
    y = m + (box_h - h0 * k) / 2
    for im in ims:
        im = im.resize((max(1, round(im.width * k)), max(1, round(h0 * k))), Image.LANCZOS)
        canvas.paste(im, (round(x), round(y)))
        x += im.width + gap * k
    d = ImageDraw.Draw(canvas)
    tw = d.textlength(title, font=font)
    d.text(((W - tw) / 2, HALF - m - title_h + 14), title, font=font, fill=(28, 26, 23))
    # multiply: white backgrounds of the scans become paper, as on a real print
    return paperlib.frame(np.asarray(canvas, np.float32) / 255.0 * paper)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('frames')
    ap.add_argument('out')
    ap.add_argument('--url', default='duynth29.github.io/molart')
    ap.add_argument('--originals', default=None, help='folder with the original prints (default: rendered tops)')
    ap.add_argument('--test', action='store_true', help='write one still per print instead of the video')
    a = ap.parse_args()
    src = Path(a.frames)
    meta = json.loads((src / 'segments.json').read_text())
    fps, n, segs = meta['fps'], meta['frames'], meta['segments']
    if a.originals:
        tfont = ImageFont.truetype(str(HERE.parent / 'public/fonts/LostType2023-Regular.otf'), 58)
        tops = [original_top(ORIGINALS[s['id']], re.sub(r'\s*\(.*\)\s*$', '', s['label']).upper(), Path(a.originals), tfont, np.random.default_rng(20 + i))
                for i, s in enumerate(segs)]
    else:
        tops = [load(src / f'top_{i}.png') for i in range(len(segs))]

    # the bottom half's paper never moves, so the protein turns on a still sheet
    paper = paperlib.paper(HALF, W, np.random.default_rng(11))
    frame_mask = paperlib.frame(np.ones((HALF, W, 3), np.float32))
    font = ImageFont.truetype(str(HERE.parent / 'public/fonts/LostType2023-Regular.otf'), 34)
    label = Image.new('RGB', (W, HALF), 'white')
    d = ImageDraw.Draw(label)
    tw = d.textlength(a.url.upper(), font=font)
    d.text(((W - tw) / 2, HALF - HALF // 22 - 74), a.url.upper(), font=font, fill=(178, 52, 34))
    label = np.asarray(label, np.float32) / 255.0

    if a.test:
        outdir = Path(a.out)
        outdir.mkdir(parents=True, exist_ok=True)
        for i, s in enumerate(segs):
            f = (s['from'] + s['to']) // 2
            bot = load(src / 'bottom' / f'{f:04d}.png') * paper * frame_mask
            bot = np.minimum(bot, label * paper)
            img = np.concatenate([tops[i], bot], axis=0)
            Image.fromarray((np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8)).save(outdir / f'test_{i}_{s["id"]}.png')
        print(outdir, len(segs), 'stills')
        return
    enc = subprocess.Popen(
        ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{2 * HALF}', '-r', str(fps), '-i', '-',
         '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', a.out],
        stdin=subprocess.PIPE)
    for f in range(n):
        i = next(k for k, s in enumerate(segs) if s['from'] <= f < s['to'])
        s = segs[i]
        top = tops[i]
        left = s['to'] - f
        if left <= FADE:                                   # fade into the next print (the last one into the first: the reel loops)
            t = 1.0 - (left - 1) / FADE
            t = t * t * (3 - 2 * t)
            top = top * (1 - t) + tops[(i + 1) % len(tops)] * t
        bot = load(src / 'bottom' / f'{f:04d}.png') * paper * frame_mask
        bot = np.minimum(bot, label * paper)              # red address printed into the paper
        img = np.concatenate([top, bot], axis=0)
        enc.stdin.write((np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8).tobytes())
    enc.stdin.close()
    if enc.wait() != 0:
        raise SystemExit('ffmpeg failed')
    print(a.out, f'{n / fps:.2f} s', f'{W}x{2 * HALF}')


if __name__ == '__main__':
    main()
