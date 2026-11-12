import { useEffect, useState } from 'react'
import { EVENT, STAFF } from '../content/tour'
import { dayLabel } from '../lib/day'
import { SERVER_MODE, staffCheckPin, staffList, staffUse } from '../lib/api'
import type { ParticipantRow } from '../lib/api'
import { Button } from '../components/ui'

/** 스태프 화면 (주소 끝 #staff) — 선물 티켓 지급 · 참가자 목록·엑셀 */
export function StaffScreen() {
  const [pin, setPin] = useState('')
  const [ok, setOk] = useState(false)
  const [err, setErr] = useState('')
  const [tab, setTab] = useState(0)
  const [busy, setBusy] = useState(false)

  const login = async () => {
    if (busy || pin.length < 4) return
    setBusy(true)
    setErr('')
    try {
      if (await staffCheckPin(pin)) setOk(true)
      else setErr('스태프 번호가 맞지 않아요')
    } catch {
      setErr('서버에 연결하지 못했어요')
    } finally {
      setBusy(false)
    }
  }

  if (!ok)
    return (
      <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col justify-center px-6">
        <h1 className="text-[clamp(26px,7.2vw,30px)] font-bold">{STAFF.title}</h1>
        <p className="mt-1 text-[15px] text-mute">
          {EVENT.hall} · {SERVER_MODE ? '구글 시트 연결' : '시안 모드(이 브라우저에만 저장, 번호 0000)'}
        </p>
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          onKeyDown={(e) => e.key === 'Enter' && login()}
          inputMode="numeric"
          type="password"
          placeholder={STAFF.pin}
          className="mt-6 h-14 rounded-2xl border-2 border-line bg-white text-center text-[22px] tracking-[0.4em] outline-none focus:border-sea"
        />
        {err && <p className="mt-2 text-[15px] font-bold text-[#c2410c]">{err}</p>}
        <Button className="mt-4" onClick={login} disabled={pin.length < 4 || busy}>
          {busy ? '확인 중…' : STAFF.enter}
        </Button>
      </main>
    )

  return (
    <main className="mx-auto min-h-dvh max-w-[720px] px-5 pb-16">
      <h1 className="pt-6 text-[24px] font-bold">{STAFF.title}</h1>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {STAFF.tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} className={`h-12 rounded-2xl text-[16px] font-bold ${tab === i ? 'bg-sea text-white' : 'bg-white text-mute'}`}>
            {t}
          </button>
        ))}
      </div>
      {tab === 0 ? <UseTab pin={pin} /> : <DataTab pin={pin} />}
    </main>
  )
}

function UseTab({ pin }: { pin: string }) {
  const [no, setNo] = useState('')
  const [res, setRes] = useState<{ no: string; r: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const go = async () => {
    const n = Number(no.replace(/\D/g, ''))
    if (!n || busy) return
    setBusy(true)
    setRes(null)
    try {
      const r = await staffUse(pin, { no: n })
      setRes({ no: String(n).padStart(4, '0'), r })
      if (r === 'ok') setNo('')
    } catch {
      setRes({ no: String(n), r: 'neterr' })
    } finally {
      setBusy(false)
    }
  }
  const text: Record<string, [string, string]> = {
    ok: ['지급 완료 처리했어요', 'text-eco'],
    already: ['이미 지급한 티켓이에요 — 중복 수령', 'text-[#c2410c]'],
    notfound: ['없는 티켓 번호예요', 'text-[#c2410c]'],
    badpin: ['스태프 번호 오류', 'text-[#c2410c]'],
    neterr: ['연결 실패 — 다시 시도', 'text-[#c2410c]'],
  }
  return (
    <section className="mt-6 rounded-3xl bg-white p-5">
      <p className="text-[16px] text-mute">참가자 폰의 티켓 화면에서 ‘지급 완료 처리’를 길게 눌러 처리하거나, 여기에 티켓 번호를 넣으세요.</p>
      <div className="mt-4 flex gap-2">
        <input
          value={no}
          onChange={(e) => setNo(e.target.value.replace(/\D/g, '').slice(0, 5))}
          onKeyDown={(e) => e.key === 'Enter' && go()}
          placeholder="티켓 번호 (예: 127)"
          inputMode="numeric"
          className="h-14 min-w-0 flex-1 rounded-2xl border-2 border-line px-4 text-[20px] outline-none focus:border-sea"
        />
        <button onClick={go} disabled={busy} className="h-14 shrink-0 whitespace-nowrap rounded-2xl bg-sea px-4 font-bold text-white">
          {busy ? '확인 중…' : '지급 완료'}
        </button>
      </div>
      {res && (
        <p className={`mt-4 text-[18px] font-bold ${text[res.r]?.[1]}`}>
          No. {res.no} · {text[res.r]?.[0] ?? res.r}
        </p>
      )}
    </section>
  )
}

function DataTab({ pin }: { pin: string }) {
  const [rows, setRows] = useState<ParticipantRow[] | null>(null)
  const [err, setErr] = useState('')
  const load = async () => {
    setErr('')
    try {
      setRows((await staffList(pin)) ?? [])
    } catch {
      setErr('불러오지 못했어요')
    }
  }
  useEffect(() => {
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const dayOf = (iso: string) => new Date(new Date(iso).getTime() + 9 * 3600e3).toISOString().slice(0, 10)
  const byDay = EVENT.days.map((d) => ({ d, n: rows?.filter((r) => dayOf(r.issued_at) === d).length ?? 0, x: rows?.filter((r) => dayOf(r.issued_at) === d && r.used_at).length ?? 0 }))
  return (
    <section className="mt-6">
      {err && <p className="text-[#c2410c]">{err}</p>}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-3xl bg-white p-4">
          <p className="text-[14px] text-mute">투어 완주 · 등록</p>
          <p className="text-[32px] font-bold">{rows?.length ?? '-'}</p>
        </div>
        <div className="rounded-3xl bg-white p-4">
          <p className="text-[14px] text-mute">선물 지급</p>
          <p className="text-[32px] font-bold">{rows?.filter((r) => r.used_at).length ?? '-'}</p>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {byDay.map((b) => (
          <div key={b.d} className="rounded-2xl bg-white p-3 text-center">
            <p className="text-[13px] text-mute">{dayLabel(b.d)}</p>
            <p className="text-[18px] font-bold">{b.n}</p>
            <p className="text-[12px] text-mute">지급 {b.x}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <Button variant="outline" onClick={load}>
          새로고침
        </Button>
      </div>
      <p className="mt-3 text-[13px] text-mute">※ 참가자 명단(이름·휴대폰·설문)은 이 화면에 나오지 않아요. 구글 시트에서 확인해 주세요.</p>
      <p className="mt-2 text-[12px] text-mute/70">암호 그림: Twemoji (CC-BY 4.0) · QR 인식: jsQR (Apache-2.0)</p>
    </section>
  )
}
