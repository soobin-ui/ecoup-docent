/**
 * 에코업 수처리 전시관 도슨트 투어 — 구글 시트 서버 (Apps Script 웹 앱)
 *
 * 붙여 넣는 곳: 구글 시트 → 확장 프로그램 → Apps Script → Code.gs 전체를 이 내용으로 교체
 * 처음 한 번: 위쪽 함수 목록에서 setup 을 골라 ▶ 실행 (시트 머리줄 + 스태프 번호 설정)
 * 배포: 배포 → 새 배포 → 유형 '웹 앱' / 실행 사용자 '나' / 액세스 '모든 사용자' → 웹 앱 URL 복사
 *
 * 참가자 응답은 '참가자' 시트에 한 줄씩 쌓입니다(실시간으로 보임).
 * 휴대폰 번호 등 개인정보 — 시트 공유 범위를 담당자로만 제한하고, 행사 종료 후 시트를 삭제하세요.
 */

var SHEET = '참가자';
var HEAD = ['티켓번호', '발급시각', '이름', '휴대폰', '구분', '전체 만족도', '이해도', '기억에 남는 전시', '재미있었던 프로그램', '에코업 분야 관심', '선물 지급시각', '기기번호'];
var COL = { no: 1, issued: 2, name: 3, phone: 4, who: 5, sat: 6, und: 7, best: 8, fun: 9, career: 10, used: 11, device: 12 };
var TZ = 'Asia/Seoul';

/** 처음 한 번 실행 — 스태프 번호는 아래 '0000'을 바꾼 뒤 실행하세요 */
function setup() {
  var STAFF_PIN = '0000';
  PropertiesService.getScriptProperties().setProperty('STAFF_PIN', STAFF_PIN);
  var sh = sheet_();
  if (sh.getLastRow() === 0) sh.appendRow(HEAD);
  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, HEAD.length).setFontWeight('bold').setBackground('#dff6ff');
  sh.getRange('D:D').setNumberFormat('@'); // 휴대폰 번호 앞 0 지키기
  sh.hideColumns(COL.device);
}

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
}

function now_() {
  return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss');
}
/** '2026-11-18 14:20:00'(시트) → ISO(앱) */
function iso_(s) {
  if (!s) return null;
  if (Object.prototype.toString.call(s) === '[object Date]') return s.toISOString();
  return String(s).replace(' ', 'T') + '+09:00';
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** 스태프 번호 확인 — 5분 안에 30번 틀리면 5분 막음(무작위 대입 방지, 안내데스크 업무는 막히지 않을 정도) */
function pinOk_(pin) {
  var cache = CacheService.getScriptCache();
  var fails = Number(cache.get('pinfail') || 0);
  if (fails >= 30) return false;
  var ok = String(pin || '') === PropertiesService.getScriptProperties().getProperty('STAFF_PIN');
  if (!ok) cache.put('pinfail', String(fails + 1), 300);
  return ok;
}

/** 참가자가 쓴 글자 → 시트에 그대로(=, +, -, @ 로 시작하면 수식으로 실행되지 않게 앞에 ' ) */
function safe_(x, max) {
  var t = String(x == null ? '' : x).replace(/\s+/g, ' ').trim().slice(0, max || 40);
  return /^[=+\-@]/.test(t) ? "'" + t : t;
}

/** 다음 티켓 번호 = 지금까지 가장 큰 번호 + 1 (가운데 줄을 지워도 번호가 겹치지 않게) */
function nextNo_(sh) {
  var last = sh.getLastRow();
  if (last < 2) return 1;
  var vals = sh.getRange(2, COL.no, last - 1, 1).getValues();
  var max = 0;
  for (var i = 0; i < vals.length; i++) max = Math.max(max, Number(vals[i][0]) || 0);
  return max + 1;
}

/** 기기번호로 줄 찾기(없으면 0) */
function findRow_(sh, col, value) {
  var last = sh.getLastRow();
  if (last < 2) return 0;
  var vals = sh.getRange(2, col, last - 1, 1).getValues();
  for (var i = 0; i < vals.length; i++) if (String(vals[i][0]) === String(value)) return i + 2;
  return 0;
}

function ticketOf_(sh, row) {
  var v = sh.getRange(row, 1, 1, HEAD.length).getValues()[0];
  return { no: Number(v[COL.no - 1]), issued_at: iso_(v[COL.issued - 1]), used_at: iso_(v[COL.used - 1]) };
}

function doGet() {
  return out_({ ok: true, service: 'ecoup-docent' });
}

function doPost(e) {
  var req;
  try {
    req = JSON.parse(e.postData.contents);
  } catch (err) {
    return out_({ error: 'bad json' });
  }
  var sh = sheet_();
  var a = req.action;

  if (a === 'register') {
    var dev = String(req.device || '');
    var phone = String(req.phone || '');
    if (dev.length < 16) return out_({ error: 'bad device' });
    if (!/^\d{8}$/.test(phone)) return out_({ error: 'bad phone' });
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(25000)) return out_({ error: 'busy' }); // 동시에 눌러도 번호가 겹치지 않게 한 명씩
    try {
      var row = findRow_(sh, COL.device, dev);
      if (!row) {
        var s = req.survey || {};
        var join = function (x) { return safe_(Array.isArray(x) ? x.join(', ') : x, 80); };
        var num = function (x) { var n = Number(x); return n >= 1 && n <= 5 ? n : ''; };
        sh.appendRow([
          nextNo_(sh), now_(), safe_(req.name, 20), '010-' + phone.slice(0, 4) + '-' + phone.slice(4),
          safe_(req.who, 20), num(s.sat), num(s.understand), join(s.best), join(s.fun), join(s.career), '', safe_(dev, 64),
        ]);
        SpreadsheetApp.flush();
        row = sh.getLastRow();
      }
      return out_({ ticket: ticketOf_(sh, row) });
    } finally {
      lock.releaseLock();
    }
  }

  if (a === 'ticket') {
    var r = findRow_(sh, COL.device, req.device);
    return out_({ ticket: r ? ticketOf_(sh, r) : null });
  }

  if (a === 'staff_pin') return out_({ ok: pinOk_(req.pin) });

  if (a === 'staff_use') {
    if (!pinOk_(req.pin)) return out_({ result: 'badpin' });
    var lock2 = LockService.getScriptLock();
    if (!lock2.tryLock(25000)) return out_({ error: 'busy' });
    try {
      var r2 = req.device ? findRow_(sh, COL.device, req.device) : findRow_(sh, COL.no, req.no);
      if (!r2) return out_({ result: 'notfound' });
      var cell = sh.getRange(r2, COL.used);
      if (cell.getValue()) return out_({ result: 'already' });
      cell.setValue(now_());
      return out_({ result: 'ok' });
    } finally {
      lock2.releaseLock();
    }
  }

  // 스태프 화면용 집계 — 이름·휴대폰·설문은 내보내지 않음(명단은 구글 시트에서 직접 확인)
  if (a === 'staff_list') {
    if (!pinOk_(req.pin)) return out_({ rows: null });
    var last = sh.getLastRow();
    var rows = [];
    if (last >= 2) {
      var vals = sh.getRange(2, 1, last - 1, HEAD.length).getValues();
      for (var i = 0; i < vals.length; i++) {
        var v = vals[i];
        rows.push({ no: Number(v[COL.no - 1]), issued_at: iso_(v[COL.issued - 1]), used_at: iso_(v[COL.used - 1]) });
      }
    }
    return out_({ rows: rows });
  }

  return out_({ error: 'unknown action' });
}
