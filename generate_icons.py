#!/usr/bin/env python3
"""Generate favicon/PWA icons matching the site's own visual style:
dark background (#0d0f10) with the mint accent (#7ee6c5) 'DN' monogram
in a monospace bold face, echoing the nav-brand 'dennis_nguyen' treatment.
"""
from PIL import Image, ImageDraw, ImageFont

BG = (13, 15, 16)      # --bg
FG = (126, 230, 197)   # --accent
FONT_PATH = "C:/Windows/Fonts/consolab.ttf"


def make_icon(size, path, corner_radius_ratio=0.22):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    radius = int(size * corner_radius_ratio)
    draw.rounded_rectangle([(0, 0), (size - 1, size - 1)], radius=radius, fill=BG)

    text = "DN"
    font_size = int(size * 0.46)
    font = ImageFont.truetype(FONT_PATH, font_size)
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (size - tw) / 2 - bbox[0]
    y = (size - th) / 2 - bbox[1]
    draw.text((x, y), text, font=font, fill=FG)

    img.save(path)
    print("wrote", path)


if __name__ == "__main__":
    make_icon(512, "icon-512.png")
    make_icon(192, "icon-192.png")
    make_icon(180, "apple-touch-icon.png", corner_radius_ratio=0)
    make_icon(32, "favicon-32.png")
