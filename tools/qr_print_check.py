"""인쇄용 스탬프 QR(PNG 7장 + PDF)을 실제로 읽어 들어 있는 주소를 확인.
실행: PYTHONUTF8=1 python tools/qr_print_check.py
"""
import glob
import os
import re

import cv2
import fitz
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://soobin-ui.github.io/ecoup-docent/'
src = open(os.path.join(ROOT, 'src', 'lib', 'stampCodes.ts'), encoding='utf-8').read()
CODES = re.findall(r"\{ code: '([^']+)', kind: '(\w+)'", src)
det = cv2.QRCodeDetector()
bad = 0

print('== PNG')
for code, kind in CODES:
    f = os.path.join(ROOT, 'qr', 'stamp', f'{code}.png')
    img = cv2.imdecode(np.fromfile(f, dtype=np.uint8), cv2.IMREAD_COLOR)
    t, _, _ = det.detectAndDecode(img)
    want = f'{SITE}?s={code}'
    ok = t == want
    bad += not ok
    print('OK ' if ok else 'XX ', f'{code:12s} {kind:8s} -> {t or "읽기 실패"}')

print('== PDF')
pdf = os.path.join(ROOT, 'qr', 'stamp', '스탬프QR_인쇄용.pdf')
d = fitz.open(pdf)
found = []
for i, p in enumerate(d):
    pix = p.get_pixmap(dpi=150)
    a = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, pix.n)[:, :, :3].copy()
    ok, ts, _, _ = det.detectAndDecodeMulti(a)
    ts = [t for t in (ts if ok else []) if t]
    found += ts
    print(f'쪽 {i + 1}:', [t.split('?s=')[-1] for t in ts] or '읽기 실패')
miss = [c for c, _ in CODES if f'{SITE}?s={c}' not in found]
bad += len(miss)
print('PDF 빠진 코드:', miss or '없음')
print('결과:', '전부 정상' if bad == 0 else f'문제 {bad}건')
