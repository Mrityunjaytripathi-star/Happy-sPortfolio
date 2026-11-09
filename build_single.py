"""Merge index.html + css/style.css + js/data.js + js/main.js into ONE file: ../index.html
Run:  python3 build_single.py"""
import re, pathlib
r = pathlib.Path(__file__).parent
html = (r/'index.html').read_text(encoding='utf-8')
css  = (r/'css/style.css').read_text(encoding='utf-8').strip()
data = (r/'js/data.js').read_text(encoding='utf-8').strip()
main = (r/'js/main.js').read_text(encoding='utf-8').strip()
for name, src in (('data.js', data), ('main.js', main), ('style.css', css)):
    assert '</script' not in src.lower() and '</style' not in src.lower(), name
ind = lambda t, n: '\n'.join((' '*n + l) if l.strip() else l for l in t.splitlines())
html = html.replace('<link rel="stylesheet" href="css/style.css" />',
    '<style>\n' + ind(css, 6) + '\n    </style>')
tag = '<script src="js/data.js"></script>\n    <script src="js/main.js"></script>'
assert tag in html
html = html.replace(tag,
    '<script>\n      /* ========== 1. CONTENT & SETTINGS (edit here) ========== */\n' + ind(data, 6)
    + '\n\n      /* ========== 2. BEHAVIOUR ========== */\n' + ind(main, 6) + '\n    </script>')
assert 'href="css/' not in html and 'src="js/' not in html
(r.parent/'index.html').write_text(html, encoding='utf-8')
print('built ../index.html', len(html), 'bytes')
