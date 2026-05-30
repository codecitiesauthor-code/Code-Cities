# Vendored fonts

Two font families are vendored here so the brand-spec typography in
`dist/westminster-pub-code-map.pdf` (and any sibling PDFs that follow)
renders identically on every machine that builds the project, without
needing internet access at build time.

## Families

| File                                | Family                | Weight / Style | Used for                                  |
|-------------------------------------|-----------------------|---------------:|-------------------------------------------|
| `Cinzel-Regular.ttf`                | Cinzel                | 400 / Regular  | Title, district labels, stamp blocks      |
| `Cinzel-Bold.ttf`                   | Cinzel                | 700 / Bold     | Display headings, "FILE 01 / 04" stamps   |
| `CormorantGaramond-Regular.ttf`     | Cormorant Garamond    | 400 / Regular  | Legend body, "Why pubs" essay             |
| `CormorantGaramond-Italic.ttf`      | Cormorant Garamond    | 400 / Italic   | Author's italic note, footnotes           |
| `CormorantGaramond-Bold.ttf`        | Cormorant Garamond    | 700 / Bold     | Legend column headings                    |

Both families are picked from the brand palette in
`content/lead-magnet-pack.md` ("Shared design language" section).

## Provenance

The original masters are variable-axis fonts published by Google Fonts:

- Cinzel             — https://github.com/google/fonts/tree/main/ofl/cinzel
- Cormorant Garamond — https://github.com/google/fonts/tree/main/ofl/cormorantgaramond

The variable masters were downloaded once, then instanced to fixed
weights (400 and 700) using `fontTools.varLib.instancer`, and the
intermediate variable files were discarded. The five static TTFs in
this folder are what ship with the project.

To re-vendor (e.g. to take a newer upstream release), the exact
procedure was:

```powershell
# from this folder
$base = 'https://raw.githubusercontent.com/google/fonts/main/ofl'
Invoke-WebRequest "$base/cinzel/Cinzel%5Bwght%5D.ttf"                       -OutFile _cinzel_var.ttf
Invoke-WebRequest "$base/cormorantgaramond/CormorantGaramond%5Bwght%5D.ttf" -OutFile _cormorant_var.ttf
Invoke-WebRequest "$base/cormorantgaramond/CormorantGaramond-Italic%5Bwght%5D.ttf" -OutFile _cormorant_italic_var.ttf

python -c "
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
specs = [
    ('_cinzel_var.ttf',         'Cinzel-Regular.ttf',              400),
    ('_cinzel_var.ttf',         'Cinzel-Bold.ttf',                 700),
    ('_cormorant_var.ttf',      'CormorantGaramond-Regular.ttf',   400),
    ('_cormorant_var.ttf',      'CormorantGaramond-Bold.ttf',      700),
    ('_cormorant_italic_var.ttf','CormorantGaramond-Italic.ttf',   400),
]
for src, dst, wght in specs:
    font = TTFont(src)
    instantiateVariableFont(font, {'wght': wght}).save(dst)
"

Remove-Item _cinzel_var.ttf, _cormorant_var.ttf, _cormorant_italic_var.ttf
```

## Licence

Both families are released under the **SIL Open Font License 1.1**, the
full text of which is in this folder:

- `OFL-Cinzel.txt`
- `OFL-Cormorant.txt`

The OFL permits free use, modification, and redistribution, including
embedding in PDFs and bundling with software, with two practical
constraints worth noting for this project:

1. The reserved font names — *Cinzel* and *Cormorant Garamond* — must
   not be reused for derivative fonts.
2. The licence text must travel with the font files. That is why both
   `OFL-*.txt` files are committed alongside the TTFs and must remain
   in this folder.

No attribution in the rendered PDF itself is required, but the
project's `README.md` may credit Natanael Gama (Cinzel) and Catharsis
Fonts (Cormorant Garamond) if the author wishes.
