"""Generate compact letter PDFs directly from the six source Markdown scripts."""
import os
import hashlib
import json
import zipfile
from pathlib import Path
from html import escape
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

root = Path(__file__).resolve().parent.parent
out = root / 'public' / 'recursos'
out.mkdir(parents=True, exist_ok=True)
font = Path(os.environ.get('RESOURCE_ARIAL', 'C:/Windows/Fonts/arial.ttf'))
bold = Path(os.environ.get('RESOURCE_ARIAL_BOLD', 'C:/Windows/Fonts/arialbd.ttf'))
if not font.exists() or not bold.exists():
    raise SystemExit('Arial no disponible: definir RESOURCE_ARIAL y RESOURCE_ARIAL_BOLD con rutas a sus TTF.')
pdfmetrics.registerFont(TTFont('Arial', str(font)))
pdfmetrics.registerFont(TTFont('Arial-Bold', str(bold)))
styles = {
    'body': ParagraphStyle('body', fontName='Arial', fontSize=11, leading=12, spaceAfter=3),
    'heading': ParagraphStyle('heading', fontName='Arial-Bold', fontSize=11, leading=12, spaceBefore=5, spaceAfter=3, keepWithNext=True),
}

class CompactCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        kwargs['pageCompression'] = 1
        super().__init__(*args, **kwargs)

sources = [*sorted((root / 'recursos').glob('0*.md')), root / 'ejemplo-flask.md']
for source in sources:
    text = source.read_text(encoding='utf-8')
    title = text.splitlines()[0].removeprefix('# ')
    story = []
    for block in text.strip().split('\n\n'):
        heading = block.startswith('#')
        value = (block.lstrip('# ').strip() if heading else block.strip()).replace('`', '')
        story.append(Paragraph(escape(value).replace('\n', '<br/>'), styles['heading' if heading else 'body']))
    document = SimpleDocTemplate(str(out / f'{source.stem}.pdf'), pagesize=letter,
        rightMargin=28.35, leftMargin=28.35, topMargin=25.5, bottomMargin=25.5,
        title=title, author='ExposicionesDi', allowSplitting=1)
    document.build(story, canvasmaker=CompactCanvas)
    spoken = ' '.join(b for b in text[text.index('## '):].split('## Apoyo')[0].split('\n\n') if not b.startswith('#'))
    count = len(spoken.split())
    print(f'{source.stem}: {count} palabras orales / {count / 145:.1f} min a 145 ppm')

lab_files = ['main.py', 'app.py', 'requirements.txt', 'INICIAR.cmd', 'comprobar.py', 'instrucciones.md']
with zipfile.ZipFile(out / 'laboratorio-flask.zip', 'w', compression=zipfile.ZIP_DEFLATED) as archive:
    for name in lab_files:
        archive.write(root / 'laboratorio-flask' / name, f'laboratorio-flask/{name}')
    archive.write(out / 'ejemplo-flask.pdf', 'laboratorio-flask/guia-demostracion.pdf')

def digest(path, text=False):
    data = path.read_text(encoding='utf-8').replace('\r\n', '\n').encode('utf-8') if text else path.read_bytes()
    return hashlib.sha256(data).hexdigest()

inputs = [*sources, *(root / 'laboratorio-flask' / name for name in lab_files),
          root / 'scripts/build-resources.py']
outputs = [*(out / f'{p.stem}.pdf' for p in sources), out / 'laboratorio-flask.zip']
manifest = {
    'inputs': {p.relative_to(root).as_posix(): digest(p, text=True) for p in inputs},
    'outputs': {p.relative_to(root).as_posix(): digest(p) for p in outputs},
}
(out / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
print('Paquete ZIP creado sin entornos virtuales, credenciales ni cachés.')
