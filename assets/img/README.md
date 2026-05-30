# Image assets

Drop the following files into this folder. The landing page references them by name — keep filenames identical or update the `<img>` paths in `index.html`.

| File | Purpose | Recommended size |
|------|---------|------------------|
| `hero-westminster.jpg` | Full-bleed hero background (Westminster silhouette, dark) | 1920×1080, ~150 KB |
| `cover-westminster.jpg` | Book cover mockup, shown in dossier section | 600×900, ~80 KB |
| `dossier-thumb-1.jpg` | Pub Code Map thumbnail | 400×260, ~40 KB |
| `dossier-thumb-2.jpg` | Hidden London Brief thumbnail | 400×260, ~40 KB |
| `dossier-thumb-3.jpg` | Symbols Field Guide thumbnail | 400×260, ~40 KB |
| `dossier-thumb-4.jpg` | Paris Code preview thumbnail | 400×260, ~40 KB |
| `author-portrait.jpg` | Author headshot (B&W or desaturated for thriller mood) | 400×400, ~50 KB |
| `favicon.png` | Browser tab icon | 32×32 |

Until real assets are dropped in, the landing page falls back gracefully (CSS placeholders).

---

## Current state: themed placeholders are present

All eight files above currently exist in this folder as dark, thriller-mood **placeholders** at the correct dimensions. The landing page will load real bytes today; no broken-image icons. Each placeholder is stamped with its filename in the bottom-right corner so you can tell at a glance that it is not the final artwork.

### Regenerate the placeholders

If you tweak the palette or labels in `_generate_placeholders.py`, regenerate everything in one command:

```powershell
& "C:\Program Files\Python312\python.exe" GITUPLOAD\assets\img\_generate_placeholders.py
```

Requires Python 3 with [Pillow](https://pillow.readthedocs.io/) installed. No network access, no other dependencies.

### Replace with real artwork

To swap in real artwork, just drop a file with the **same filename** into this folder and commit. No HTML, CSS, or script changes needed.

**Priority order before any public launch:**

1. **`author-portrait.jpg`** — MUST be replaced. The current file is a monogram (initials in a frame), not a face. It carries a "REPLACE WITH PHOTOGRAPH" caption to make this obvious in reviews.
2. **`cover-westminster.jpg`** — replace with the final cover artwork from your designer.
3. **`hero-westminster.jpg`** — replace with real Westminster photography (dusk or night, dark, wide).
4. **`dossier-thumb-1..4.jpg`** — replace with thumbnails generated from the actual dossier PDFs in `dist/`.
5. **`favicon.png`** — replace once you have a final logomark.

The placeholder generator script can stay in the repo as a fallback; delete it once every file above is final, if you prefer a leaner tree.
