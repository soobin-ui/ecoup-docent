import { useEffect, useState } from 'react'
import { EVENT, HANDSON, STAFF } from '../content/tour'
import { dayLabel, scheduleDay } from '../lib/day'
import { SERVER_MODE, getClosedSlots, staffCheckPin, staffExchange, staffResponses, staffSetSlot } from '../lib/api'
import type { ResponseRow, SlotKey } from '../lib/api'
import { Button } from '../components/ui'

/** 스태프 화면 (주소 끝 #staff) — 교환 확인 · 회차 마감 · 설문 엑셀 */
export function StaffScreen() {
  const [pin, setPin] = useState('')
  const [ok, setOk] = useState(false)
  const [err, setErr] = useState('')
  const [tab, setTab] = useState(0)

  const login = async () => {
    setErr('')
    try {
      if (await staffCheckPin(pin)) setOk(true)
      else setErr('스태프 번호가 맞지 않아요')
    } catch {
      setErr('서버에 연결하지 못했어요')
    }
  }

  if (!ok)
    return (
      <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col justify-center px-6">
        <h1 className="text-[26px] font-extrabold">{STAFF.title}</h1>
        <p className="mt-1 text-[14px] text-mute">
          {EVENT.hall} · {SERVER_MODE ? '서버 연결' : '시안 모드(이 브라우저에만 저장, 번호 0000)'}
        </p>
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          onKeyDown={(e) => e.key === 'Enter' && login()}
          inputMode="numeric"
          type="password"
          placeholder={STAFF.pin}
          className="mt-6 h-14 rounded-2xl border-2 border-line bg-white text-center text-[22px] tracking-[0.4em] outline-none focus:border-deep"
        />
        {err && <p className="mt-2 text-[14px] font-semibold text-[#c2410c]">{err}</p>}
        <Button className="mt-4" onClick={login} disabled={pin.length < 4}>
          {STAFF.enter}
        </Button>
      </main>
    )

  return (
    <main className="mx-auto min-h-dvh max-w-[720px] px-5 pb-16">
      <h1 className="pt-6 text-[24px] font-extrabold">{STAFF.title}</h1>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {STAFF.tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} className={`h-12 rounded-2xl text-[15px] font-extrabold ${tab === i ? 'bg-deep text-white' : 'bg-white text-mute'}`}>
            {t}
          </button>
        ))}
      </div>
      {tab === 0 && <ExchangeTab pin={pin} />}
      {tab === 1 && <SlotTab pin={pin} />}
      {tab === 2 && <DataTab pin={pin} />}
    </main>
  )
}

function ExchangeTab({ pin }: { pin: string }) {
  const [code, setCode] = useState('')
  const [res, setRes] = useState<{ code: string; r: string } | null>(null)
  const go = async () => {
    const c = code.trim().toUpperCase()
    if (!c) return
    try {
      const r = await staffExchange(pin, { code: c })
      setRes({ code: c, r })
      if (r === 'ok') setCode('')
    } catch {
      setRes({ code: c, r: 'neterr' })
    }
  }
  const text: Record<string, [string, string]> = {
    ok: ['교환 완료 처리했어요', 'text-eco'],
    already: ['이미 교환한 번호예요 — 중복 수령', 'text-[#c2410c]'],
    notfound: ['없는 번호예요', 'text-[#c2410c]'],
    badpin: ['스태프 번호 오류', 'text-[#c2410c]'],
    neterr: ['연결 실패 — 다시 시도', 'text-[#c2410c]'],
  }
  return (
    <section className="mt-6 rounded-3xl bg-white p-5">
      <p className="text-[15px] text-mute">참가자 폰에서 ‘스태프 확인’을 길게 눌러 처리하거나, 여기에 교환 번호를 넣으세요.</p>
      <div className="mt-4 flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && go()}
          placeholder="A-0001"
          autoCapitalize="characters"
          className="h-14 min-w-0 flex-1 rounded-2xl border-2 border-line px-4 font-mono text-[22px] uppercase outline-none focus:border-deep"
        />
        <button onClick={go} className="h-14 shrink-0 whitespace-nowrap rounded-2xl bg-deep px-4 font-extrabold text-white">
          교환 처리
        </button>
      </div>
      {res && (
        <p className={`mt-4 text-[18px] font-extrabold ${text[res.r]?.[1]}`}>
          {res.code} · {text[res.r]?.[0] ?? res.r}
        </p>
      )}
    </section>
  )
}

function SlotTab({ pin }: { pin: string }) {
  const [day, setDay] = useState(scheduleDay().day)
  const [closed, setClosed] = useState<SlotKey[]>([])
  const load = () => getClosedSlots(day).then(setClosed).catch(() => setClosed([]))
  useEffect(() => {
    load()
  }, [day]) // eslint-disable-line react-hooks/exhaustive-deps
  const toggle = async (program: string, time: string) => {
    const isClosed = closed.some((c) => c.program === program && c.time === time)
    await staffSetSlot(pin, { program, day, time }, !isClosed)
    load()
  }
  return (
    <section className="mt-6">
      <div className="flex gap-2">
        {EVENT.days.map((d) => (
          <button key={d} onClick={() => setDay(d)} className={`h-11 flex-1 rounded-xl text-[14px] font-extrabold ${day === d ? 'bg-ink text-white' : 'bg-white text-mute'}`}>
            {dayLabel(d)}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[14px] text-mute">회차를 누르면 마감 ↔ 열림이 바뀌고, 참가자 화면에 바로 ‘마감’으로 보여요.</p>
      {HANDSON.programs.map((pr) => (
        <div key={pr.id} className="mt-4 rounded-3xl bg-white p-4">
          <p className="text-[17px] font-extrabold">{pr.name}</p>
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
            {HANDSON.times.map((t) => {
              const c = closed.some((x) => x.program === pr.id && x.time === t)
              return (
                <button key={t} onClick={() => toggle(pr.id, t)} className={`h-12 rounded-xl text-[15px] font-extrabold ${c ? 'bg-[#fde2d6] text-[#c2410c]' : 'border border-line bg-white text-ink'}`}>
                  {t}
                  <span className="block text-[10.5px] font-semibold">{c ? '마감' : '열림'}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </section>
  )
}

const COLS: [keyof ResponseRow, string][] = [
  ['code', '교환번호'],
  ['day', '날짜'],
  ['created_at', '제출시각'],
  ['nickname', '닉네임'],
  ['who', '구분'],
  ['understand', '이해도'],
  ['best', '기억에 남는 섹션'],
  ['career', '환경 분야 관심'],
  ['came', '방문 경로'],
  ['booking_filter', '정수기 체험 회차'],
  ['booking_led', '무드등 체험 회차'],
  ['exchanged_at', '기념품 교환시각'],
]

function DataTab({ pin }: { pin: string }) {
  const [rows, setRows] = useState<ResponseRow[] | null>(null)
  const [err, setErr] = useState('')
  const load = async () => {
    setErr('')
    try {
      setRows((await staffResponses(pin)) ?? [])
    } catch {
      setErr('불러오지 못했어요')
    }
  }
  useEffect(() => {
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const download = () => {
    if (!rows) return
    const kst = (s: string | null) => (s ? new Date(new Date(s).getTime() + 9 * 3600e3).toISOString().slice(0, 16).replace('T', ' ') : '')
    const esc = (v: string) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const lines = [COLS.map((c) => esc(c[1])).join(',')]
    for (const r of rows) lines.push(COLS.map(([k]) => esc(k === 'created_at' || k === 'exchanged_at' ? kst(r[k] as string | null) : (r[k] as string))).join(','))
    // 엑셀이 한글을 깨뜨리지 않도록 BOM
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `에코업_도슨트_설문_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  const byDay = EVENT.days.map((d) => ({ d, n: rows?.filter((r) => r.day === d).length ?? 0, x: rows?.filter((r) => r.day === d && r.exchanged_at).length ?? 0 }))
  return (
    <section className="mt-6">
      {err && <p className="text-[#c2410c]">{err}</p>}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-3xl bg-white p-4">
          <p className="text-[13px] text-mute">설문 응답</p>
          <p className="text-[32px] font-extrabold">{rows?.length ?? '-'}</p>
        </div>
        <div className="rounded-3xl bg-white p-4">
          <p className="text-[13px] text-mute">기념품 교환</p>
          <p className="text-[32px] font-extrabold">{rows?.filter((r) => r.exchanged_at).length ?? '-'}</p>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {byDay.map((b) => (
          <div key={b.d} className="rounded-2xl bg-white p-3 text-center">
            <p className="text-[12px] text-mute">{dayLabel(b.d)}</p>
            <p className="text-[18px] font-extrabold">{b.n}</p>
            <p className="text-[11px] text-mute">교환 {b.x}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <Button onClick={download} disabled={!rows?.length}>
          엑셀(CSV) 내려받기
        </Button>
        <Button variant="outline" onClick={load} className="w-32">
          새로고침
        </Button>
      </div>
    </section>
  )
}
