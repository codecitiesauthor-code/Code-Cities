"""Generate themed placeholder image assets for the Code Cities landing page.

Each asset is a deterministic, dark-thriller-mood placeholder rendered at the
exact dimensions documented in this folder's README. The intent is that the
landing page has real bytes to load until real artwork (photography, book
cover art, an author headshot) is dropped in to replace them.

Run from the repository root or from anywhere; outputs go next to this script:

    & "C:\\Program Files\\Python312\\python.exe" GITUPLOAD/assets/img/_generate_placeholders.py

Requires Pillow. No network access, no external assets beyond the optional
Cinzel TTFs already shipped in GITUPLOAD/assets/fonts/.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

# Shared design language. Change these to re-theme every asset in one place.
PALETTE = {
    "bg": (10, 14, 26),         # midnight, near-black blue
    "bg_deep": (4, 6, 12),      # darker shade for vignette edges
    "accent": (212, 165, 116),  # warm sodium-lamp amber
    "text": (232, 220, 196),    # parchment
    "muted": (110, 108, 100),   # faded label grey
}

HERE = Path(__file__).resolve().parent
FONTS_DIR = HERE.parent / "fonts"

# Map logical font roles to the TTFs we ship. Falls back to Pillow's default
# bitmap font if the TTF is missing, so the script never hard-fails on a
# fresh checkout.
FONT_FILES = {
    "display": FONTS_DIR / "Cinzel-Bold.ttf",
    "label":   FONTS_DIR / "Cinzel-Regular.ttf",
    "body":    FONTS_DIR / "CormorantGaramond-Regular.ttf",
    "body_it": FONTS_DIR / "CormorantGaramond-Italic.ttf",
}


def load_font(role: str, size: int) -> ImageFont.ImageFont:
    """Load a TTF font by role, or fall back to Pillow's default."""
    path = FONT_FILES.get(role)
    if path and path.exists():
        return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def _radial_vignette(size: tuple[int, int], strength: float = 0.55) -> Image.Image:
    """Return an RGB image with a soft radial darkening from edges inward.

    `strength` controls how dark the corners go (0 = no vignette, 1 = pure black).
    Implemented as a blurred elliptical mask so it works at any aspect ratio.
    """
    w, h = size
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).ellipse(
        (-int(w * 0.15), -int(h * 0.15), int(w * 1.15), int(h * 1.15)),
        fill=255,
    )
    mask = mask.filter(ImageFilter.GaussianBlur(radius=max(w, h) * 0.18))
    bright = Image.new("RGB", size, PALETTE["bg"])
    dark = Image.new("RGB", size, PALETTE["bg_deep"])
    # Composite: dark where mask is low (corners), bright where mask is high.
    blended = Image.composite(bright, dark, mask)
    # Subtle additional inward fade for cinematic feel.
    fade = Image.new("L", size, 0)
    ImageDraw.Draw(fade).ellipse(
        (int(w * 0.05), int(h * 0.05), int(w * 0.95), int(h * 0.95)),
        fill=int(255 * (1.0 - strength)),
    )
    fade = fade.filter(ImageFilter.GaussianBlur(radius=max(w, h) * 0.25))
    overlay = Image.new("RGB", size, PALETTE["bg_deep"])
    return Image.composite(blended, overlay, fade)


def _draw_frame(img: Image.Image, inset: int = 12, color: tuple[int, int, int] | None = None) -> None:
    """Draw a thin 1px inner frame to make the placeholder feel intentional."""
    draw = ImageDraw.Draw(img)
    c = color or PALETTE["accent"]
    w, h = img.size
    draw.rectangle((inset, inset, w - inset - 1, h - inset - 1), outline=c, width=1)


def _text_centered(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str,
                   font: ImageFont.ImageFont, fill: tuple[int, int, int]) -> None:
    """Draw text centered on (x, y)."""
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text((xy[0] - tw / 2 - bbox[0], xy[1] - th / 2 - bbox[1]), text, font=font, fill=fill)


def _filename_stamp(img: Image.Image, filename: str) -> None:
    """Bake the filename into the bottom-right corner so reviewers can tell
    placeholders apart at a glance."""
    draw = ImageDraw.Draw(img)
    font = load_font("body", max(10, img.size[1] // 60))
    text = f"PLACEHOLDER / {filename}"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    w, h = img.size
    draw.text((w - tw - 18, h - th - 14), text, font=font, fill=PALETTE["muted"])


def build_hero() -> Path:
    """Full-bleed cinematic backdrop with a simple Big Ben silhouette."""
    size = (1920, 1080)
    img = _radial_vignette(size, strength=0.6)
    draw = ImageDraw.Draw(img)

    # Geometric Big Ben silhouette, low-left.
    # Coordinates chosen to read as a tower from across the room, not to be literal.
    tower_x, ground_y = 280, 880
    tower_w, tower_h = 110, 520
    silhouette = PALETTE["bg_deep"]

    # Main tower shaft.
    draw.rectangle((tower_x, ground_y - tower_h, tower_x + tower_w, ground_y), fill=silhouette)
    # Clock face block (slightly wider than the shaft).
    clock_top = ground_y - tower_h - 20
    draw.rectangle((tower_x - 15, clock_top, tower_x + tower_w + 15, clock_top + 110), fill=silhouette)
    # Clock face circle.
    cx, cy, r = tower_x + tower_w // 2, clock_top + 55, 32
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=PALETTE["accent"], width=2)
    # Clock hands.
    draw.line((cx, cy, cx, cy - r + 6), fill=PALETTE["accent"], width=2)
    draw.line((cx, cy, cx + r - 10, cy), fill=PALETTE["accent"], width=2)
    # Spire: stacked smaller blocks topped by a triangle.
    spire_top = clock_top - 40
    draw.rectangle((tower_x + 20, spire_top, tower_x + tower_w - 20, clock_top), fill=silhouette)
    draw.polygon(
        [
            (tower_x + tower_w // 2, spire_top - 90),
            (tower_x + 20, spire_top),
            (tower_x + tower_w - 20, spire_top),
        ],
        fill=silhouette,
    )

    # Title lockup, lower-third.
    title_font = load_font("display", 96)
    sub_font = load_font("label", 28)
    _text_centered(draw, (size[0] // 2, 760), "THE WESTMINSTER CODE", title_font, PALETTE["text"])
    _text_centered(draw, (size[0] // 2, 830), "A CODE CITIES NOVEL", sub_font, PALETTE["accent"])

    _draw_frame(img, inset=24)
    _filename_stamp(img, "hero-westminster.jpg")

    out = HERE / "hero-westminster.jpg"
    img.save(out, format="JPEG", quality=82, optimize=True, progressive=True)
    return out


def build_cover() -> Path:
    """Book-cover mockup: matte near-black, parchment border, stacked title."""
    size = (600, 900)
    img = Image.new("RGB", size, PALETTE["bg"])
    # Subtle top-to-bottom gradient for a matte finish.
    overlay = Image.new("RGB", size, PALETTE["bg_deep"])
    fade = Image.linear_gradient("L").resize(size)
    img = Image.composite(overlay, img, fade)

    draw = ImageDraw.Draw(img)
    _draw_frame(img, inset=18)

    # Top series mark.
    series_font = load_font("label", 22)
    _text_centered(draw, (size[0] // 2, 90), "CODE CITIES  ::  BOOK ONE", series_font, PALETTE["accent"])

    # Title, stacked over two lines for cover-poster feel.
    title_font = load_font("display", 64)
    _text_centered(draw, (size[0] // 2, 380), "THE", title_font, PALETTE["text"])
    _text_centered(draw, (size[0] // 2, 460), "WESTMINSTER", title_font, PALETTE["text"])
    _text_centered(draw, (size[0] // 2, 540), "CODE", title_font, PALETTE["text"])

    # Author line.
    author_font = load_font("label", 26)
    _text_centered(draw, (size[0] // 2, 800), "C.A. STERLING", author_font, PALETTE["accent"])
    _text_centered(draw, (size[0] // 2, 840), "a novel", load_font("body_it", 22), PALETTE["muted"])

    _filename_stamp(img, "cover-westminster.jpg")
    out = HERE / "cover-westminster.jpg"
    img.save(out, format="JPEG", quality=85, optimize=True, progressive=True)
    return out


def build_dossier_thumb(index: int, label: str) -> Path:
    """One of the four dossier thumbnails. `index` is 1-based."""
    size = (400, 260)
    img = _radial_vignette(size, strength=0.5)
    draw = ImageDraw.Draw(img)
    _draw_frame(img, inset=10)

    # "FILE 0N" tag, top-left.
    tag_font = load_font("label", 14)
    draw.text((22, 22), f"FILE 0{index}", font=tag_font, fill=PALETTE["accent"])

    # Centered dossier name. Split into two lines if it's long enough to wrap.
    title_font = load_font("display", 22)
    words = label.split(" ")
    if len(words) >= 3:
        mid = len(words) // 2
        line1, line2 = " ".join(words[:mid]), " ".join(words[mid:])
        _text_centered(draw, (size[0] // 2, size[1] // 2 - 16), line1, title_font, PALETTE["text"])
        _text_centered(draw, (size[0] // 2, size[1] // 2 + 16), line2, title_font, PALETTE["text"])
    else:
        _text_centered(draw, (size[0] // 2, size[1] // 2), label, title_font, PALETTE["text"])

    # Footer tagline.
    foot_font = load_font("body_it", 14)
    _text_centered(draw, (size[0] // 2, size[1] - 30), "reader dossier", foot_font, PALETTE["muted"])

    filename = f"dossier-thumb-{index}.jpg"
    _filename_stamp(img, filename)
    out = HERE / filename
    img.save(out, format="JPEG", quality=78, optimize=True, progressive=True)
    return out


def build_author_portrait(initials: str = "C.A.S") -> Path:
    """Square monogram placeholder. NOT a face. Must be replaced before launch."""
    size = (400, 400)
    img = _radial_vignette(size, strength=0.55)
    draw = ImageDraw.Draw(img)
    _draw_frame(img, inset=12)

    # Large monogram dead-center.
    monogram_font = load_font("display", 140)
    _text_centered(draw, (size[0] // 2, size[1] // 2 - 10), initials, monogram_font, PALETTE["text"])

    # Caption underneath so no one mistakes this for a real photo.
    caption_font = load_font("label", 14)
    _text_centered(draw, (size[0] // 2, size[1] - 50), "REPLACE WITH PHOTOGRAPH", caption_font, PALETTE["accent"])

    _filename_stamp(img, "author-portrait.jpg")
    out = HERE / "author-portrait.jpg"
    img.save(out, format="JPEG", quality=80, optimize=True, progressive=True)
    return out


def build_favicon() -> Path:
    """32x32 monogram on a dark background. Saved as PNG for transparency support."""
    size = (32, 32)
    img = Image.new("RGB", size, PALETTE["bg"])
    draw = ImageDraw.Draw(img)
    draw.rectangle((0, 0, size[0] - 1, size[1] - 1), outline=PALETTE["accent"], width=1)
    # At 32px the bundled default font is more legible than Cinzel.
    font = ImageFont.load_default()
    _text_centered(draw, (size[0] // 2, size[1] // 2), "CC", font, PALETTE["text"])
    out = HERE / "favicon.png"
    img.save(out, format="PNG", optimize=True)
    return out


def main() -> None:
    written: list[Path] = []
    written.append(build_hero())
    written.append(build_cover())
    for i, label in enumerate(
        ["PUB CODE MAP", "HIDDEN LONDON BRIEF", "SYMBOLS FIELD GUIDE", "PARIS CODE PREVIEW"],
        start=1,
    ):
        written.append(build_dossier_thumb(i, label))
    written.append(build_author_portrait())
    written.append(build_favicon())

    # Report so the run is self-verifying.
    print(f"Wrote {len(written)} files to {HERE}")
    for path in written:
        size_kb = path.stat().st_size / 1024
        with Image.open(path) as im:
            w, h = im.size
        print(f"  {path.name:<28}  {w:>4}x{h:<4}  {size_kb:>6.1f} KB")


if __name__ == "__main__":
    main()
