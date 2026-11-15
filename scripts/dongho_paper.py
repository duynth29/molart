#!/usr/bin/env python3
"""Lay a molart render (white background) onto giấy điệp — dó paper coated with crushed scallop shell —
and frame it like a Đông Hồ print.

usage: python3 scripts/dongho_paper.py in.png out.png [--seed 7] [--no-frame]
"""
import argparse

import numpy as np
from PIL import Image, ImageFilter


def noise(h, w, scale, rng):
    """Smooth value noise: random grid upsampled with bicubic filtering."""
    g = rng.random((max(2, h // scale), max(2, w // scale))).astype(np.float32)
    im = Image.fromarray((g * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    return np.asarray(im, np.float32) / 255.0


def paper(h, w, rng):
    base = np.array([0.95, 0.90, 0.79], np.float32)                  # warm cream of điệp
    tone = 0.55 * noise(h, w, 160, rng) + 0.3 * noise(h, w, 40, rng) + 0.15 * noise(h, w, 8, rng)
    p = base[None, None, :] * (0.93 + 0.09 * tone[..., None])
    # dó bark fibres: short, faint, mostly horizontal streaks
    fib = rng.random((h, w)).astype(np.float32)
    fib = np.asarray(Image.fromarray((fib * 255).astype(np.uint8)).filter(ImageFilter.BoxBlur(0)).resize((w // 6, h)).resize((w, h), Image.BILINEAR), np.float32) / 255.0
    p *= (1.0 - 0.05 * np.clip((fib - 0.6) * 4, 0, 1))[..., None]
    # điệp shimmer: brushed-on shell coating, in broad strokes, glittering with fine flecks
    brush = noise(h, w, 90, rng)
    fleck = (rng.random((h, w)) > 0.985).astype(np.float32)
    fleck = np.asarray(Image.fromarray((fleck * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7)), np.float32) / 255.0
    p += (0.035 * brush + 0.5 * fleck * (0.4 + 0.6 * brush))[..., None] * np.array([1.0, 0.98, 0.95], np.float32)
    return np.clip(p, 0, 1)


def frame(img, color=(0.11, 0.10, 0.09)):
    h, w, _ = img.shape
    t = max(3, h // 220)
    m1, m2 = h // 22, h // 22 + 3 * t
    c = np.array(color, np.float32)
    for m, th in ((m1, t * 2), (m2, t)):                              # bold outer and thin inner rule
        img[m:m + th, m:w - m] = c
        img[h - m - th:h - m, m:w - m] = c
        img[m:h - m, m:m + th] = c
        img[m:h - m, w - m - th:w - m] = c
    return img


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src')
    ap.add_argument('dst')
    ap.add_argument('--seed', type=int, default=7)
    ap.add_argument('--no-frame', action='store_true')
    a = ap.parse_args()
    rng = np.random.default_rng(a.seed)
    art = np.asarray(Image.open(a.src).convert('RGB'), np.float32) / 255.0
    h, w, _ = art.shape
    p = paper(h, w, rng)
    # woodblock pigment sits in the paper: multiply, so white (unprinted) areas become paper
    out = art * p
    if not a.no_frame:
        out = frame(out)
    Image.fromarray((np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8)).save(a.dst)


if __name__ == '__main__':
    main()
