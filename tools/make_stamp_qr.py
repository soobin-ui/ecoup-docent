"""스탬프 QR 인쇄용 — 경진대회 공통 QR 1종(작품 5곳에 같은 것) + 체험 공통 QR 1종(테이블 2곳에 같은 것).

현장에서 스티커를 붙일 때 어느 작품에 어느 QR 인지 헷갈리지 않게, 2종만 쓰고 색을 확실히 다르게 함.
  - 경진대회 작품용: 파랑 테두리, 코드 CONTEST
  - 체험 테이블용: 주황 테두리, 코드 HANDS
앱은 '경진대회냐 체험이냐'만 봄(src/lib/stampCodes.ts 의 kind). 예전 작품별 코드 7개도 계속 인식됨.

실행: PYTHONUTF8=1 python tools/make_stamp_qr.py
출력(VER 붙음): qr/stamp/경진대회_작품용_공통_v2.png, 체험_테이블용_공통_v2.png,
      스탬프QR_인쇄용_공통_v2.pdf (경진대회 5장 + 체험 2장), 스탬프QR_2종_각1장_v2.pdf (각 1장)
"""
import os
import re
import segno
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'qr', 'stamp')
os.makedirs(OUT, exist_ok=True)

SITE = 'https://soobin-ui.github.io/ecoup-docent/'
VER = '_v2'  # 수정본은 새 파일로(덮어쓰지 않음)
src = open(os.path.join(ROOT, 'src', 'lib', 'stampCodes.ts'), encoding='utf-8').read()
CODES = dict((c, k) for c, k in re.findall(r"\{ code: '([^']+)', kind: '(\w+)'", src))
assert CODES.get('CONTEST') == 'contest' and CODES.get('HANDS') == 'hands', 'stampCodes.ts 에 CONTEST·HANDS 공통 코드가 있어야 함'

FONT_DIR = os.path.join(os.environ['LOCALAPPDATA'], 'Microsoft', 'Windows', 'Fonts')
BOLD = os.path.join(FONT_DIR, 'GmarketSansBold.otf')
MED = os.path.join(FONT_DIR, 'GmarketSansMedium.otf')
SEA = (11, 74, 117)
GRAY = (88, 113, 128)

TYPES = [
    # 코드, 파일 이름, 큰 제목, 붙일 곳, 테두리·제목 색, 몇 장
    ('CONTEST', '경진대회_작품용_공통', '경진대회 작품용', '본선 작품 5개에 한 장씩 붙여 주세요', (0, 140, 200), 5),
    ('HANDS', '체험_테이블용_공통', '체험 테이블용', '체험 테이블 2곳에 한 장씩 붙여 주세요', (232, 89, 12), 2),
]

W, H = 1000, 1300
cards = []  # (이미지, 몇 장, 이름)
for code, fname, title, where, color, n in TYPES:
    url = f'{SITE}?s={code}'
    q = segno.make(url, error='m')
    tmp = os.path.join(OUT, f'_{code}.png')
    q.save(tmp, scale=22, border=2, dark='#0b4a75')
    qr = Image.open(tmp).convert('RGB')
    os.remove(tmp)
    qr = qr.resize((700, 700), Image.NEAREST)

    im = Image.new('RGB', (W, H), 'white')
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((16, 16, W - 16, H - 16), radius=48, outline=color, width=22)
    # 머리띠: 색 띠 위에 큰 제목(붙이는 사람이 멀리서도 구분)
    d.rounded_rectangle((16, 16, W - 16, 230), radius=48, fill=color)
    d.rectangle((16, 150, W - 16, 230), fill=color)
    d.text((W / 2, 92), '에코업 수처리 전시관 · STAMP', font=ImageFont.truetype(MED, 40), fill='white', anchor='mm')
    d.text((W / 2, 178), title, font=ImageFont.truetype(BOLD, 78), fill='white', anchor='mm')
    im.paste(qr, ((W - 700) // 2, 270))
    d.text((W / 2, 1065), '투어 화면의 [QR코드 찍기]로 찍어 주세요', font=ImageFont.truetype(BOLD, 42), fill=SEA, anchor='mm')
    d.text((W / 2, 1200), code, font=ImageFont.truetype(MED, 30), fill=(160, 176, 186), anchor='mm')
    fn = os.path.join(OUT, f'{fname}{VER}.png')
    im.save(fn)
    cards.append((im, n, title, where))
    print(fn, url)

# A4(세로) 한 장에 2개씩 → PDF (경진대회 5장 + 체험 2장 = 7장, 4쪽)
A4 = (2480, 3508)
seq = []
for im, n, title, where in cards:
    for i in range(n):
        seq.append((im, f'{title} {i + 1}/{n} · {where}'))
cap = ImageFont.truetype(MED, 40)
pages = []
for i in range(0, len(seq), 2):
    pg = Image.new('RGB', A4, 'white')
    dg = ImageDraw.Draw(pg)
    for j, (c, note) in enumerate(seq[i:i + 2]):
        cc = c.resize((1200, 1560))
        y = 110 + j * 1700
        pg.paste(cc, ((A4[0] - 1200) // 2, y))
        dg.text((A4[0] / 2, y + 1600), note, font=cap, fill=GRAY, anchor='mm')
    pages.append(pg)
pdf = os.path.join(OUT, f'스탬프QR_인쇄용_공통{VER}.pdf')
pages[0].save(pdf, save_all=True, append_images=pages[1:], resolution=300)
print(pdf, len(pages), 'pages')

# 2종 각 1장(경진대회 1 + 체험 1)만 A4 한 쪽에
one = Image.new('RGB', A4, 'white')
d1 = ImageDraw.Draw(one)
for j, (c, n, title, where) in enumerate(cards):
    cc = c.resize((1200, 1560))
    y = 110 + j * 1700
    one.paste(cc, ((A4[0] - 1200) // 2, y))
    d1.text((A4[0] / 2, y + 1600), f'{title} · {where}', font=cap, fill=GRAY, anchor='mm')
pdf2 = os.path.join(OUT, f'스탬프QR_2종_각1장{VER}.pdf')
one.save(pdf2, resolution=300)
print(pdf2, '1 page')
