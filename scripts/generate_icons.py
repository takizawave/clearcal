#!/usr/bin/env python3
"""Render ClearCal's rounded-rectangle SVG to RGBA PNGs without dependencies.

This deliberately supports only the simple, untransformed rectangles in our
icon source. Four-by-four coverage sampling keeps small icons smooth.
"""
from pathlib import Path
import struct
import xml.etree.ElementTree as ET
import zlib

ROOT = Path(__file__).resolve().parent.parent
SIZES = (16, 32, 48, 128)


def chunk(kind, data):
    return (struct.pack('>I', len(data)) + kind + data
            + struct.pack('>I', zlib.crc32(kind + data) & 0xffffffff))


def main():
    source = ET.parse(ROOT / 'icons/clearcal.svg').getroot()
    rectangles = []
    for element in source:
        if element.tag.endswith('title'):
            continue
        if element.tag != '{http://www.w3.org/2000/svg}rect':
            raise ValueError('Only rounded rectangles are supported')
        a = element.attrib
        shape = tuple(float(a[k]) for k in ('x', 'y', 'width', 'height', 'rx'))
        color = tuple(bytes.fromhex(a['fill'][1:]))
        rectangles.append((shape, color))

    for size in SIZES:
        pixels = bytearray()
        for py in range(size):
            pixels.append(0)  # PNG scanline filter: None
            for px in range(size):
                covered = 0
                rgb = [0, 0, 0]
                for sy in range(4):
                    for sx in range(4):
                        x = (px + (sx + .5) / 4) * 64 / size
                        y = (py + (sy + .5) / 4) * 64 / size
                        for (left, top, width, height, radius), color in rectangles:
                            if not (left <= x <= left + width and top <= y <= top + height):
                                continue
                            cx = min(max(x, left + radius), left + width - radius)
                            cy = min(max(y, top + radius), top + height - radius)
                            if (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2:
                                covered += 1
                                for i in range(3):
                                    rgb[i] += color[i]
                                break
                pixels.extend(round(v / covered) if covered else 0 for v in rgb)
                pixels.append(round(255 * covered / 16))
        png = b'\x89PNG\r\n\x1a\n'
        png += chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0))
        png += chunk(b'sRGB', b'\x00')
        png += chunk(b'IDAT', zlib.compress(bytes(pixels), 9))
        png += chunk(b'IEND', b'')
        path = ROOT / f'icons/icon-{size}.png'
        path.write_bytes(png)
        print(path.relative_to(ROOT))


if __name__ == '__main__':
    main()
