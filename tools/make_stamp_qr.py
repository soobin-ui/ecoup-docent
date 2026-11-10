"""스탬프 QR 7장(작품 5 + 체험 테이블 2) — 인쇄용 PNG 카드 + A4 PDF 한 묶음.

코드 표는 src/lib/stampCodes.ts 와 같아야 합니다(둘을 같이 고칠 것).
실행: PYTHONUTF8=1 python tools/make_stamp_qr.py
출력: qr/stamp/*.png, qr/stamp/스탬프QR_인쇄용.pdf
"""
import os
import re
import segno
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'qr', 'stamp')
os.makedirs(OUT, exist_ok=True)

SITE = 'https://soobin-ui.github.io/ecoup-docent/'
src = open(os.path.join(ROOT, 'src', 'lib', 'stampCodes.ts'), encoding='utf-8').read()
CODES = re.findall(r"\{ code: '([^']+)', kind: '(\w+)', label: '([^']+)' \}", src)
assert len(CODES) == 7, CODES

FONT_DIR = os.path.join(os.environ['LOCALAPPDATA'], 'Microsoft', 'Windows', 'Fonts')
BOLD = os.path.join(FONT_DIR, 'GmarketSansBold.otf')
MED = os.path.join(FONT_DIR, 'GmarketSansMedium.otf')
SEA = (11, 74, 117)
CYAN = (0, 173, 208)

W, H = 1000, 1300
cards = []
for code, kind, label in CODES:
    url = f'{SITE}?s={code}'
    q = segno.make(url, error='m')
    tmp = os.path.join(OUT, f'_{code}.png')
    q.save(tmp, scale=22, border=2, dark='#0b4a75')
    qr = Image.open(tmp).convert('RGB')
    os.remove(tmp)
    qr = qr.resize((720, 720), Image.NEAREST)

    im = Image.new('RGB', (W, H), 'white')
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((20, 20, W - 20, H - 20), radius=48, outline=CYAN, width=10)
    head = '경진대회' if kind == 'contest' else '체험'
    d.text((W / 2, 110), '에코업 수처리 전시관', font=ImageFont.truetype(MED, 46), fill=SEA, anchor='mm')
    d.text((W / 2, 190), f'STAMP · {head}', font=ImageFont.truetype(BOLD, 64), fill=CYAN, anchor='mm')
    im.paste(qr, ((W - 720) // 2, 260))
    name = label.split(' · ', 1)[1]
    d.text((W / 2, 1050), name, font=ImageFont.truetype(BOLD, 62), fill=SEA, anchor='mm')
    d.text((W / 2, 1140), '투어 화면의 [QR코드 찍기]로 찍어 주세요', font=ImageFont.truetype(MED, 38), fill=(88, 113, 128), anchor='mm')
    d.text((W / 2, 1215), code, font=ImageFont.truetype(MED, 30), fill=(160, 176, 186), anchor='mm')
    fn = os.path.join(OUT, f'{code}.png')
    im.save(fn)
    cards.append(im)
    print(fn, url)

# A4(세로) 한 장에 2개씩 → PDF
A4 = (2480, 3508)
pages = []
for i in range(0, len(cards), 2):
    pg = Image.new('RGB', A4, 'white')
    for j, c in enumerate(cards[i:i + 2]):
        cc = c.resize((1200, 1560))
        pg.paste(cc, ((A4[0] - 1200) // 2, 120 + j * 1700))
    pages.append(pg)
pdf = os.path.join(OUT, '스탬프QR_인쇄용.pdf')
pages[0].save(pdf, save_all=True, append_images=pages[1:], resolution=300)
print(pdf, len(pages), 'pages')
