#!/usr/bin/env python3
"""
Generate PWA icons for Ashesi Meals.
Renders the UtensilsCrossed icon (fork + knife) on a red rounded background.

Requires: pip install Pillow
"""

import os
import math
from PIL import Image, ImageDraw


PRIMARY = (216, 30, 44, 255)   # #D81E2C
WHITE   = (255, 255, 255, 255)
TRANSP  = (0, 0, 0, 0)


def draw_utensils(draw: ImageDraw.ImageDraw, left: float, top: float, s: float) -> None:
    """
    Draw the UtensilsCrossed icon into the given draw context.
    Coordinate system: 24x24 Lucide viewBox scaled by `s`, offset by (left, top).

    Paths from Lucide UtensilsCrossed:
      M4 3v7a3 3 0 0 0 3 3v8   ← fork outer tine + handle
      M7 3v6                   ← fork middle tine
      M10 3v6                  ← fork inner tine
      M18 3c-1.5 1-2 3-2 6     ← knife blade (cubic bezier down-left)
      s.5 4 2 5                ← knife blade (smooth bezier down-right)
      v7                       ← knife handle (straight down)
    """
    lw = max(2, round(2.0 * s))

    def px(x: float) -> float:
        return left + x * s

    def py(y: float) -> float:
        return top + y * s

    # ── FORK ────────────────────────────────────────────────
    # Outer tine (left): M4 3 v7
    draw.line([(px(4), py(3)), (px(4), py(10))], fill=WHITE, width=lw)

    # Arc from (4,10) curving right to (7,13): approximate cubic bezier
    arc_pts: list[tuple[float, float]] = []
    for i in range(13):
        t = i / 12
        # Cubic Bezier: P0=(4,10), P1=(4,13), P2=(7,13), P3=(7,13)
        p0x, p0y = px(4), py(10)
        p1x, p1y = px(4), py(13)
        p2x, p2y = px(7), py(13)
        p3x, p3y = px(7), py(13)
        bx = (1-t)**3*p0x + 3*(1-t)**2*t*p1x + 3*(1-t)*t**2*p2x + t**3*p3x
        by = (1-t)**3*p0y + 3*(1-t)**2*t*p1y + 3*(1-t)*t**2*p2y + t**3*p3y
        arc_pts.append((bx, by))
    for i in range(len(arc_pts) - 1):
        draw.line([arc_pts[i], arc_pts[i + 1]], fill=WHITE, width=lw)

    # Fork handle: (7,13) → (7,21)
    draw.line([(px(7), py(13)), (px(7), py(21))], fill=WHITE, width=lw)

    # Middle tine: M7 3 v6
    draw.line([(px(7), py(3)), (px(7), py(9))], fill=WHITE, width=lw)

    # Inner tine: M10 3 v6
    draw.line([(px(10), py(3)), (px(10), py(9))], fill=WHITE, width=lw)

    # ── KNIFE ───────────────────────────────────────────────
    # M18 3 c-1.5 1 -2 3 -2 6  → end (16, 9)
    # s.5 4 2 5                 → end (18, 14)
    # v7                        → end (18, 21)

    knife_pts: list[tuple[float, float]] = []

    # Segment 1: cubic bezier (18,3) to (16,9)
    for i in range(13):
        t = i / 12
        p0x, p0y = px(18), py(3)
        p1x, p1y = px(16.5), py(4)
        p2x, p2y = px(16), py(6)
        p3x, p3y = px(16), py(9)
        bx = (1-t)**3*p0x + 3*(1-t)**2*t*p1x + 3*(1-t)*t**2*p2x + t**3*p3x
        by = (1-t)**3*p0y + 3*(1-t)**2*t*p1y + 3*(1-t)*t**2*p2y + t**3*p3y
        knife_pts.append((bx, by))

    # Segment 2: smooth bezier (16,9) to (18,14)
    # The reflected control point from seg 1 end: cp2 reflected = (16, 9) + ((16, 9) - (16, 6)) = (16, 12)
    # Then explicit cp2 = (18.5, 13), end = (18, 14)
    for i in range(1, 13):
        t = i / 12
        p0x, p0y = px(16), py(9)
        p1x, p1y = px(16), py(12)
        p2x, p2y = px(18.5), py(13)
        p3x, p3y = px(18), py(14)
        bx = (1-t)**3*p0x + 3*(1-t)**2*t*p1x + 3*(1-t)*t**2*p2x + t**3*p3x
        by = (1-t)**3*p0y + 3*(1-t)**2*t*p1y + 3*(1-t)*t**2*p2y + t**3*p3y
        knife_pts.append((bx, by))

    # Segment 3: straight down to (18,21)
    knife_pts.append((px(18), py(21)))

    for i in range(len(knife_pts) - 1):
        draw.line([knife_pts[i], knife_pts[i + 1]], fill=WHITE, width=lw)


def make_icon(size: int, maskable: bool = False) -> Image.Image:
    img = Image.new('RGBA', (size, size), TRANSP)
    draw = ImageDraw.Draw(img)

    if maskable:
        # Maskable: full square, icon in safe zone (inner 80%)
        draw.rectangle([0, 0, size, size], fill=PRIMARY)
        margin = size * 0.20
    else:
        # Standard: rounded rectangle
        r = round(size * 0.22)
        draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=PRIMARY)
        margin = size * 0.225

    icon_dim = size - 2 * margin
    s = icon_dim / 24
    draw_utensils(draw, margin, margin, s)

    return img


def main() -> None:
    os.makedirs('public/icons', exist_ok=True)

    specs = [
        ('public/icons/icon-192.png',             192, False),
        ('public/icons/icon-512.png',             512, False),
        ('public/icons/icon-512-maskable.png',    512, True),
        ('public/icons/apple-touch-icon.png',     180, False),
        ('public/favicon.png',                     48, False),
    ]

    for path, size, maskable in specs:
        icon = make_icon(size, maskable=maskable)
        icon.save(path, 'PNG')
        print(f'[OK] {path}  ({size}x{size}{"  maskable" if maskable else ""})')

    print('\nAll icons generated.')
    print('Update index.html favicon link: <link rel="icon" href="/favicon.png">')


if __name__ == '__main__':
    main()
